import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import type { UpdateSlotRequestDto } from '../../data/dtos/slot.dto';
import type { ProSlotEntity } from '../../domain/entities/slot.entity';

interface Props {
  slot: ProSlotEntity | null;
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (data: UpdateSlotRequestDto) => void;
}

/** Valeur attendue par un <input type="datetime-local">, en heure locale. */
function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default function SlotEditDialog({
  slot,
  isPending,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [startAt, setStartAt] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(1);

  // Le formulaire repart des valeurs du creneau a chaque ouverture.
  useEffect(() => {
    if (!slot) return;
    setStartAt(toLocalInputValue(slot.startAt));
    setMaxParticipants(slot.maxParticipants);
  }, [slot]);

  if (!slot) return null;

  const bookedSeats = slot.maxParticipants - slot.remainingSeats;
  const hasBookings = bookedSeats > 0;
  // Le serveur refuse ces deux cas : les annoncer evite un aller-retour.
  const belowBooked = maxParticipants < bookedSeats;
  const movedWhileBooked =
    hasBookings && startAt !== toLocalInputValue(slot.startAt);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      startAt: new Date(startAt).toISOString(),
      maxParticipants,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le créneau</DialogTitle>
          <DialogDescription>
            {hasBookings
              ? `${bookedSeats} place${bookedSeats > 1 ? 's' : ''} déjà réservée${bookedSeats > 1 ? 's' : ''} sur ce créneau.`
              : 'Aucune réservation sur ce créneau.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="slot-start">Date et heure</Label>
            <Input
              id="slot-start"
              type="datetime-local"
              value={startAt}
              disabled={hasBookings}
              onChange={(e) => setStartAt(e.target.value)}
            />
            {hasBookings && (
              <p className="text-xs text-muted-foreground">
                Un créneau réservé ne peut pas être déplacé : les participants
                ont réservé cette date.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slot-seats">Participants max</Label>
            <Input
              id="slot-seats"
              type="number"
              min={Math.max(1, bookedSeats)}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
            />
            {belowBooked && (
              <p className="text-xs text-destructive">
                {bookedSeats} place{bookedSeats > 1 ? 's' : ''} déjà réservée
                {bookedSeats > 1 ? 's' : ''} : le maximum ne peut pas être
                inférieur.
              </p>
            )}
          </div>

          {error != null && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {(error as Error).message ||
                  'La modification n’a pas pu être enregistrée.'}
              </span>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending || belowBooked || movedWhileBooked}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
