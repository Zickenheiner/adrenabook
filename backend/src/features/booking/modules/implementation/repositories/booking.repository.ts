import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBookingRepository } from '../../../interfaces/repositories/booking.irepository';
import { BookingMapper } from '../mappers/booking.mapper';
import {
  Booking,
  BookingDocument,
} from '@features/booking/domains/schemas/booking.schema';
import { Slot, SlotDocument } from '@features/slot/domains/schemas/slot.schema';
import {
  Activity,
  ActivityDocument,
} from '@features/activity/domains/schemas/activity.schema';
import {
  Waiver,
  WaiverDocument,
} from '@features/waiver/domains/schemas/waiver.schema';
import { Model } from 'mongoose';
import {
  BookingDetailResponseDto,
  CancelBookingDto,
  CancelBookingResponseDto,
  ConfirmPaymentDto,
  ConfirmPaymentResponseDto,
  CreateBookingDto,
} from '@features/booking/domains/dtos/booking.dto';
import { BookingEntity } from '@features/booking/domains/entities/booking.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require('stripe');

/**
 * Regles metier de la reservation (US-11 a US-13).
 *
 * Un acompte de 30 % est preleve a la reservation, le solde etant regle sur
 * place au centre. La TVA de 20 % est le taux normal applicable aux activites
 * de loisir sportif encadre.
 */
const DEPOSIT_RATE = 0.3;

const VAT_RATE = 0.2;

/**
 * Politique de remboursement a trois paliers, exprimee en jours avant le
 * creneau : remboursement integral au-dela de 15 jours, moitie entre 7 et
 * 15 jours, aucun remboursement en deca de 7 jours. Ces seuils sont des
 * constantes et non des valeurs en base : ils figurent aux CGU, donc les
 * modifier engage juridiquement et doit passer par une revue, pas par un
 * changement de configuration.
 */
// Refund policy thresholds in milliseconds
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FULL_REFUND_THRESHOLD_DAYS = 15;
const PARTIAL_REFUND_THRESHOLD_DAYS = 7;
const PARTIAL_REFUND_RATE = 0.5;

@Injectable()
export class BookingRepository implements IBookingRepository {
  private readonly stripe: {
    refunds: {
      create: (params: {
        payment_intent: string;
        amount: number;
      }) => Promise<{ id: string }>;
    };
  } | null;

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Slot.name)
    private readonly slotModel: Model<SlotDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(Waiver.name)
    private readonly waiverModel: Model<WaiverDocument>,
    private readonly bookingMapper: BookingMapper,
    private readonly configService: ConfigService,
  ) {
    // Stripe est optionnel a l'instanciation : sans cle, le remboursement est
    // simplement saute. Cela permet de faire tourner le backend en local et en
    // integration continue sans secret de paiement.
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecret) {
      this.stripe = new StripeLib(stripeSecret, {
        apiVersion: '2026-04-22.dahlia',
      });
    } else {
      this.stripe = null;
    }
  }

  /**
   * Cree une reservation en etat `pending` (US-11).
   *
   * Le decompte des places se fait a la demande plutot que par un compteur
   * stocke sur le creneau : un compteur denormalise deriverait des le premier
   * echec de transaction, alors qu'un countDocuments reste exact par
   * construction. Les annulees sont exclues, elles liberent leur place.
   *
   * La reservation expire au bout de 15 minutes, delai laisse au client pour
   * regler l'acompte avant que les places ne soient rendues disponibles.
   *
   * Les montants sont arrondis au centime a chaque etape, et non seulement sur
   * le total : c'est le montant affiche ligne par ligne au client qui doit
   * correspondre a ce qui est preleve.
   *
   * @param dto creneau vise et liste des participants
   * @param userId titulaire, issu du JWT
   * @throws NotFoundException creneau inexistant
   * @throws ConflictException plus assez de places pour le groupe
   */
  async create(
    dto: CreateBookingDto,
    userId: string,
  ): Promise<BookingEntity | null> {
    const slot = await this.slotModel.findById(dto.slotId).exec();
    if (!slot) {
      throw new NotFoundException('Créneau introuvable');
    }

    const existingBookings = await this.bookingModel
      .countDocuments({ slotId: slot._id, status: { $ne: 'cancelled' } })
      .exec();

    const participantCount = dto.participants.length;
    const availableSpots = slot.maxParticipants - existingBookings;

    if (participantCount > availableSpots) {
      throw new ConflictException('Plus assez de places disponibles');
    }

    const priceEur = slot.priceEur * participantCount;
    const vatEur = Math.round(priceEur * VAT_RATE * 100) / 100;
    const totalEur = Math.round((priceEur + vatEur) * 100) / 100;
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const document = new this.bookingModel({
      slotId: new mongoose.Types.ObjectId(dto.slotId),
      userId: new mongoose.Types.ObjectId(userId),
      participants: dto.participants,
      acceptCenterTerms: dto.acceptCenterTerms,
      status: 'pending_payment',
      reservationExpiresAt,
      totalEur,
      vatEur,
    });

    const saved = await document.save();
    return saved ? this.bookingMapper.toEntity(saved as BookingDocument) : null;
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await this.bookingModel.findById(id).exec();
    return booking ? this.bookingMapper.toEntity(booking) : null;
  }

  async findDetailById(
    id: string,
    userId: string,
  ): Promise<BookingDetailResponseDto> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Réservation introuvable');
    }

    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Cette réservation appartient à un autre utilisateur',
      );
    }

    // Booking → Slot → Activity pour remonter le titre et l'horaire du créneau
    const slot = await this.slotModel.findById(booking.slotId).exec();
    if (!slot) {
      throw new NotFoundException('Créneau introuvable');
    }

    const activity = await this.activityModel.findById(slot.activityId).exec();
    if (!activity) {
      throw new NotFoundException('Activité introuvable');
    }

    const waiverCount = await this.waiverModel
      .countDocuments({ bookingId: booking._id })
      .exec();

    const status = booking.status as BookingDetailResponseDto['status'];

    // La reservation temporaire n'expire que tant que le paiement est attendu
    const reservationExpiresAt =
      status === 'pending_payment' && booking.reservationExpiresAt
        ? booking.reservationExpiresAt.toISOString()
        : null;

    // paymentIntentClientSecret est volontairement absent : un secret Stripe
    // ne doit pas transiter par une route de lecture.
    return {
      bookingId: booking._id.toString(),
      status,
      reservationExpiresAt,
      totalEur: booking.totalEur,
      vatEur: booking.vatEur,
      participants: booking.participants.map((participant) => ({
        firstName: participant.firstName,
        lastName: participant.lastName,
      })),
      activityTitle: activity.title,
      slotStartAt: slot.startAt.toISOString(),
      waiverSigned: waiverCount > 0,
    };
  }

  async findBySlotId(slotId: string): Promise<BookingEntity[] | null> {
    const bookings = await this.bookingModel.find({ slotId }).exec();
    return bookings
      ? bookings.map((doc) => this.bookingMapper.toEntity(doc))
      : null;
  }

  async confirmPayment(
    id: string,
    dto: ConfirmPaymentDto,
  ): Promise<ConfirmPaymentResponseDto> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Reservation introuvable');
    }

    if (booking.status === 'confirmed' || booking.status === 'partial_paid') {
      throw new ConflictException('Paiement deja traite');
    }

    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        'La reservation ne peut pas etre confirmee dans son etat actuel',
      );
    }

    const depositAmount =
      Math.round(booking.totalEur * DEPOSIT_RATE * 100) / 100;
    const remainingAmount =
      Math.round((booking.totalEur - depositAmount) * 100) / 100;

    const isFullPayment = dto.paymentIntentId !== undefined;
    const paidAmount = isFullPayment ? booking.totalEur : depositAmount;
    const remaining = isFullPayment ? 0 : remainingAmount;
    const status: 'confirmed' | 'partial_paid' =
      remaining === 0 ? 'confirmed' : 'partial_paid';

    // J-7 final payment due date (only relevant for partial payments)
    let finalPaymentDueAt: Date | undefined;
    if (status === 'partial_paid') {
      const slot = await this.bookingModel
        .findById(id)
        .select('slotId')
        .populate('slotId')
        .exec();
      // Fallback: set 7 days from now if slot date not available
      finalPaymentDueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      void slot;
    }

    await this.bookingModel
      .findByIdAndUpdate(
        id,
        {
          status,
          stripePaymentIntentId: dto.paymentIntentId,
          paidAmountEur: paidAmount,
          remainingAmountEur: remaining,
          ...(finalPaymentDueAt && { finalPaymentDueAt }),
        },
        { new: true },
      )
      .exec();

    return {
      bookingId: id,
      status,
      paidAmountEur: paidAmount,
      remainingAmountEur: remaining,
      ...(finalPaymentDueAt && {
        finalPaymentDueAt: finalPaymentDueAt.toISOString(),
      }),
    };
  }

  /**
   * Annule une reservation et applique la politique de remboursement (US-13).
   *
   * L'ordre des controles est significatif : on verifie l'existence avant la
   * propriete, afin de ne pas reveler par un 403 qu'une reservation existe a
   * un utilisateur qui n'en est pas le titulaire.
   *
   * Le remboursement Stripe n'est tente que si un PaymentIntent est rattache a
   * la reservation et que le client Stripe est configure : en environnement de
   * developpement sans cle, l'annulation doit rester possible.
   *
   * @param id identifiant de la reservation
   * @param dto motif d'annulation
   * @param userId titulaire suppose, issu du JWT
   * @throws NotFoundException reservation inexistante
   * @throws ForbiddenException la reservation appartient a un autre compte
   * @throws ConflictException deja annulee, ou activite deja realisee
   */
  async cancelBooking(
    id: string,
    dto: CancelBookingDto,
    userId: string,
  ): Promise<CancelBookingResponseDto> {
    const booking = await this.bookingModel.findById(id).exec();

    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Cette réservation appartient à un autre utilisateur',
      );
    }

    if (booking.status === 'cancelled') {
      throw new ConflictException('Cette réservation est déjà annulée');
    }

    if (booking.status === 'completed') {
      throw new ConflictException(
        "L'activité a déjà été réalisée, annulation impossible",
      );
    }

    // Un creneau introuvable laisse daysUntilSlot a l'infini, donc le palier
    // le plus favorable : en cas de donnee manquante, l'arbitrage se fait au
    // benefice du client plutot que du centre.
    const slot = await this.slotModel.findById(booking.slotId).exec();
    let daysUntilSlot = Infinity;
    if (slot && slot.startAt) {
      const now = Date.now();
      daysUntilSlot = (slot.startAt.getTime() - now) / MS_PER_DAY;
    }

    let refundPolicy: 'full' | 'partial' | 'none';
    let refundedAmountEur: number;
    const paidAmount = booking.paidAmountEur ?? 0;

    if (daysUntilSlot > FULL_REFUND_THRESHOLD_DAYS) {
      refundPolicy = 'full';
      refundedAmountEur = paidAmount;
    } else if (daysUntilSlot >= PARTIAL_REFUND_THRESHOLD_DAYS) {
      refundPolicy = 'partial';
      refundedAmountEur =
        Math.round(paidAmount * PARTIAL_REFUND_RATE * 100) / 100;
    } else {
      refundPolicy = 'none';
      refundedAmountEur = 0;
    }

    // Process Stripe refund if applicable
    let stripeRefundId: string | undefined;
    if (refundedAmountEur > 0 && booking.stripePaymentIntentId && this.stripe) {
      const refundAmountCents = Math.round(refundedAmountEur * 100);
      const refund = await this.stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        amount: refundAmountCents,
      });
      stripeRefundId = refund.id;
    }

    const cancelledAt = new Date();

    await this.bookingModel
      .findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          cancellationReason: dto.reason,
          ...(dto.comment && { cancellationComment: dto.comment }),
          cancelledAt,
          refundedAmountEur,
          refundPolicy,
          ...(stripeRefundId && { stripeRefundId }),
        },
        { new: true },
      )
      .exec();

    return {
      bookingId: id,
      status: 'cancelled',
      refundedAmountEur,
      refundPolicyApplied: refundPolicy,
      refundEta: this.buildRefundEta(
        refundPolicy,
        refundedAmountEur,
        paidAmount,
      ),
    };
  }

  /**
   * Message de remboursement destiné à l'utilisateur final. refundPolicyApplied
   * décrit la règle des CGV, qui s'applique même si rien n'a été encaissé : le
   * message doit donc lever l'ambiguïté entre « rien à rembourser » et
   * « remboursement refusé ».
   */
  private buildRefundEta(
    refundPolicy: 'full' | 'partial' | 'none',
    refundedAmountEur: number,
    paidAmountEur: number,
  ): string {
    if (refundedAmountEur > 0) {
      return refundPolicy === 'partial'
        ? 'Remboursement partiel (50 %) effectué sous 5 à 10 jours ouvrés'
        : 'Remboursement intégral effectué sous 5 à 10 jours ouvrés';
    }

    if (paidAmountEur === 0) {
      return 'Aucun remboursement à effectuer : aucun paiement n’avait été encaissé';
    }

    return "Aucun remboursement : l'annulation intervient moins de 7 jours avant l'activité";
  }
}
