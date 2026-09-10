import { Card, CardContent } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import type { BookingSummaryEntity } from '../../domain/entities/dashboard.entity';

interface Props {
  booking: BookingSummaryEntity;
}

const statusLabel: Record<BookingSummaryEntity['status'], string> = {
  confirmed: 'Confirmée',
  pending_payment: 'En attente de paiement',
  cancelled: 'Annulée',
};

const statusVariant: Record<
  BookingSummaryEntity['status'],
  'default' | 'secondary' | 'destructive'
> = {
  confirmed: 'default',
  pending_payment: 'secondary',
  cancelled: 'destructive',
};

export default function UpcomingBookingCard({ booking }: Props) {
  const formattedDate = booking.date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {booking.coverPhotoUrl && (
          <div className="relative h-40 sm:h-auto sm:w-36 flex-shrink-0">
            <img
              src={booking.coverPhotoUrl}
              alt={booking.activityTitle}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardContent className="flex flex-1 flex-col justify-between gap-3 p-4">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight">
                {booking.activityTitle}
              </h3>
              <Badge variant={statusVariant[booking.status]}>
                {statusLabel[booking.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{booking.centerName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="capitalize">{formattedDate}</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
