import { useFormContext } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import type { CreateBookingFormData } from '../../domain/schemas/booking.schema';

interface Props {
  index: number;
  onRemove?: () => void;
  canRemove: boolean;
}

export default function BookingParticipantForm({
  index,
  onRemove,
  canRemove,
}: Props) {
  const form = useFormContext<CreateBookingFormData>();

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Participant {index + 1}
        </h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Supprimer le participant</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name={`participants.${index}.firstName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Prénom</FormLabel>
              <FormControl>
                <Input placeholder="Jean" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`participants.${index}.lastName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Nom</FormLabel>
              <FormControl>
                <Input placeholder="Dupont" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`participants.${index}.birthDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Date de naissance</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`participants.${index}.weightKg`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Poids (kg){' '}
                <span className="text-muted-foreground font-normal">
                  — optionnel
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  placeholder="70"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
