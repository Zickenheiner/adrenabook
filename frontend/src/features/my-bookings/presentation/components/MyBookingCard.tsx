import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  CreditCard,
  FileSignature,
  Image as ImageIcon,
  MapPin,
  Receipt,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Card } from '@/core/components/ui/card';
import { cn } from '@/core/utils/cn';
import { resolvePhotoUrl } from '@/core/utils/photo-url';
import routes from '@/core/constants/routes';
import type {
  BookingStatus,
  MyBookingEntity,
} from '../../domain/entities/my-booking.entity';

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  pending_payment: {
    label: 'En attente de paiement',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  partial_paid: {
    label: 'Acompte versé',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  },
  confirmed: {
    label: 'Confirmée',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  cancelled: {
    label: 'Annulée',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
};

interface Props {
  booking: MyBookingEntity;
}

export default function MyBookingCard({ booking }: Props) {
  const [coverFailed, setCoverFailed] = useState(false);
  const coverUrl = resolvePhotoUrl(booking.coverPhotoUrl);
  const status = STATUS[booking.status];

  const isPast = booking.startAt.getTime() < Date.now();
  const isCancelled = booking.status === 'cancelled';
  // Une sortie passée ou annulée ne se prépare plus : seule la facture garde
  // un usage.
  const isActive = !isCancelled && !isPast;
  const isPaid =
    booking.status === 'confirmed' || booking.status === 'partial_paid';

  const to = (route: string) => route.replace(':id', booking.bookingId);

  return (
    <Card className="overflow-hidden border-border/50">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-32 w-full shrink-0 bg-muted sm:h-auto sm:w-40">
          {coverUrl && !coverFailed ? (
            <img
              src={coverUrl}
              alt={booking.activityTitle}
              className="h-full w-full object-cover"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-7 w-7" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="font-semibold">{booking.activityTitle}</h3>
              {booking.centerName && (
                <p className="text-sm text-muted-foreground">
                  {booking.centerName}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn('shrink-0 text-xs', status?.className)}
            >
              {status?.label ?? booking.status}
            </Badge>
          </div>

          <div className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
              {booking.startAt.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              à{' '}
              {booking.startAt.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {formatDuration(booking.durationMinutes)}
            </p>
            <p className="flex items-center gap-1.5">
              <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
              {booking.participants} participant
              {booking.participants > 1 ? 's' : ''}
            </p>
            {booking.centerAddress && (
              <p className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{booking.centerAddress}</span>
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold">
              {booking.totalEur.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
            {booking.remainingAmountEur > 0 && (
              <span className="text-muted-foreground">
                — reste{' '}
                {booking.remainingAmountEur.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}{' '}
                à régler
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="outline" size="sm">
              <Link to={to(routes.bookingConfirmation)}>Voir le détail</Link>
            </Button>

            {isActive && booking.status === 'pending_payment' && (
              <Button asChild size="sm">
                <Link to={to(routes.bookingConfirmation)}>
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                  Payer
                </Link>
              </Button>
            )}

            {isActive && !booking.waiverSigned && (
              <Button asChild variant="outline" size="sm">
                <Link to={to(routes.waiverSign)}>
                  <FileSignature className="mr-1.5 h-3.5 w-3.5" />
                  Signer la décharge
                </Link>
              </Button>
            )}

            {isPaid && (
              <Button asChild variant="outline" size="sm">
                <Link to={to(routes.invoiceDownload)}>
                  <Receipt className="mr-1.5 h-3.5 w-3.5" />
                  Facture
                </Link>
              </Button>
            )}

            {isActive && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Link to={to(routes.bookingCancellation)}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Annuler
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
