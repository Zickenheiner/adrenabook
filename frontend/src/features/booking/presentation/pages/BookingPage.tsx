import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, CalendarCheck } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Form } from '@/core/components/ui/form';
import routes from '@/core/constants/routes';
import { ApiError } from '@/core/errors/api.error';
import {
  createBookingSchema,
  type CreateBookingFormData,
} from '../../domain/schemas/booking.schema';
import { useCreateBooking } from '../../domain/hooks/booking.hook';
import { useSlotDetail } from '../../domain/hooks/slot-detail.hook';
import BookingSlotSummary from '../components/BookingSlotSummary';
import BookingParticipantsSection from '../components/BookingParticipantsSection';
import BookingTermsSection from '../components/BookingTermsSection';

function BookingPageSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl space-y-6">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

function BookingPageMissingSlot() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-lg font-semibold">Créneau introuvable</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Aucun créneau sélectionné. Veuillez choisir un créneau depuis la fiche
        activité.
      </p>
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
    </div>
  );
}

function BookingPageSlotError({ error }: { error: unknown }) {
  const navigate = useNavigate();
  const isNotFound = error instanceof ApiError && error.status === 404;

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-lg font-semibold">
        {isNotFound ? 'Créneau introuvable' : 'Créneau indisponible'}
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {isNotFound
          ? "Ce créneau n'existe plus. Choisissez-en un autre depuis la fiche activité."
          : 'Les informations de ce créneau n’ont pas pu être chargées. Réessayez dans un instant.'}
      </p>
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
    </div>
  );
}

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slotId = searchParams.get('slotId');

  const { slot, slotIsLoading, slotError } = useSlotDetail(slotId ?? '');
  const { createBookingAsync, createBookingIsPending, createBookingError } =
    useCreateBooking();

  const form = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      slotId: slotId ?? '',
      participants: [
        { firstName: '', lastName: '', birthDate: '', weightKg: undefined },
      ],
      acceptCenterTerms: false,
    },
  });

  if (!slotId) return <BookingPageMissingSlot />;

  if (slotIsLoading || createBookingIsPending) return <BookingPageSkeleton />;

  if (slotError || !slot) return <BookingPageSlotError error={slotError} />;

  const onSubmit = async (data: CreateBookingFormData) => {
    try {
      const booking = await createBookingAsync(data);
      // Aucune donnée de réservation en query param : la page de confirmation
      // recharge le détail depuis GET /bookings/:id.
      navigate(routes.bookingConfirmation.replace(':id', booking.bookingId));
    } catch {
      // L'erreur est déjà dans createBookingError
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl"
    >
      {/* Navigation retour */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Retour
      </Button>

      {/* Titre */}
      <div className="flex items-center gap-3 mb-6">
        <CalendarCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Réserver un créneau</h1>
      </div>

      {/* Résumé du créneau réellement chargé depuis GET /slots/:id */}
      <div className="mb-6">
        <BookingSlotSummary slot={slot} />
      </div>

      {/* Formulaire */}
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Participants */}
            <BookingParticipantsSection />

            {/* Conditions */}
            <BookingTermsSection />

            {/* Erreur API */}
            {createBookingError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {(createBookingError as Error)?.message ||
                    'Une erreur est survenue lors de la réservation. Veuillez réessayer.'}
                </span>
              </motion.div>
            )}

            {/* Bouton de soumission */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createBookingIsPending}
            >
              {createBookingIsPending
                ? 'Réservation en cours…'
                : 'Confirmer la réservation'}
            </Button>
          </form>
        </Form>
      </FormProvider>
    </motion.div>
  );
}
