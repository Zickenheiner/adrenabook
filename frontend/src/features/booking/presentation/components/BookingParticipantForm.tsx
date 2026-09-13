import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';
import { useCurrentAccount } from '@/features/account/domain/hooks/account.hook';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import {
  constrainsWeight,
  type CreateBookingFormData,
} from '../../domain/schemas/booking.schema';
import type { SlotPrerequisites } from '../../domain/entities/slot-detail.entity';

interface Props {
  index: number;
  onRemove?: () => void;
  canRemove: boolean;
  prerequisites?: SlotPrerequisites;
  /** Seul le premier participant peut etre le titulaire du compte. */
  canBeSelf?: boolean;
}

export default function BookingParticipantForm({
  index,
  onRemove,
  canRemove,
  prerequisites,
  canBeSelf = false,
}: Props) {
  const form = useFormContext<CreateBookingFormData>();
  const { account } = useCurrentAccount();
  const [isSelf, setIsSelf] = useState(false);

  // Cocher remplit l'etat civil du titulaire, decocher rend la main : on vide
  // pour ne pas laisser croire que les champs restent lies au compte.
  useEffect(() => {
    if (!canBeSelf) return;
    if (isSelf && account) {
      form.setValue(`participants.${index}.firstName`, account.firstName, {
        shouldValidate: true,
      });
      form.setValue(`participants.${index}.lastName`, account.lastName, {
        shouldValidate: true,
      });
      form.setValue(`participants.${index}.birthDate`, account.birthDate, {
        shouldValidate: true,
      });
    }
  }, [isSelf, account, canBeSelf, form, index]);

  const handleSelfChange = (checked: boolean) => {
    setIsSelf(checked);
    if (!checked) {
      form.setValue(`participants.${index}.firstName`, '');
      form.setValue(`participants.${index}.lastName`, '');
      form.setValue(`participants.${index}.birthDate`, '');
    }
  };

  // Le poids ne sert qu'aux activites qui le bornent : ailleurs, le demander
  // reviendrait a collecter une donnee personnelle sans usage.
  const weightRequired = constrainsWeight(prerequisites);
  const weightRange = [
    prerequisites?.minWeightKg != null
      ? `min ${prerequisites.minWeightKg}`
      : '',
    prerequisites?.maxWeightKg != null
      ? `max ${prerequisites.maxWeightKg}`
      : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Participant {index + 1}
        </h4>
        <div className="flex items-center gap-3">
          {canBeSelf && account && (
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`self-${index}`}
                checked={isSelf}
                onCheckedChange={(v) => handleSelfChange(v === true)}
              />
              <Label
                htmlFor={`self-${index}`}
                className="text-xs font-normal cursor-pointer"
              >
                C'est moi
              </Label>
            </div>
          )}
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

        {weightRequired && (
          <FormField
            control={form.control}
            name={`participants.${index}.weightKg`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  Poids (kg){' '}
                  <span className="text-muted-foreground font-normal">
                    — {weightRange} kg
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
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
