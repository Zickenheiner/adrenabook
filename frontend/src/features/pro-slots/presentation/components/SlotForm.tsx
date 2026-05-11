import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createSlotSchema,
  type CreateSlotFormData,
} from '../../domain/schemas/slot.schema';
import type { CreateSlotRequestDto } from '../../data/dtos/slot.dto';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/core/components/ui/radio-group';
import { Label } from '@/core/components/ui/label';
import { Separator } from '@/core/components/ui/separator';
import { CalendarDays, Repeat, Loader2 } from 'lucide-react';

interface Props {
  onSubmit: (data: CreateSlotRequestDto) => void;
  isPending: boolean;
}

export default function SlotForm({ onSubmit, isPending }: Props) {
  const form = useForm<CreateSlotFormData>({
    resolver: zodResolver(createSlotSchema),
    defaultValues: {
      slotType: 'single',
      singleStartAt: '',
      recurrence: {
        rrule: '',
        untilDate: '',
      },
      durationMinutes: 60,
      maxParticipants: 10,
      priceEur: 0,
      instructorIds: [''],
    },
  });

  const slotType = form.watch('slotType');

  function handleSubmit(values: CreateSlotFormData) {
    const payload: CreateSlotRequestDto = {
      durationMinutes: values.durationMinutes,
      maxParticipants: values.maxParticipants,
      priceEur: values.priceEur,
      instructorIds: values.instructorIds.filter((id) => id.trim() !== ''),
    };

    if (values.slotType === 'single' && values.singleStartAt) {
      payload.singleStartAt = values.singleStartAt;
    } else if (values.slotType === 'recurring' && values.recurrence) {
      payload.recurrence = values.recurrence;
    }

    onSubmit(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Type de créneau */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Type de créneau</Label>
          <FormField
            control={form.control}
            name="slotType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        field.value === 'single'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => field.onChange('single')}
                    >
                      <RadioGroupItem value="single" id="single" />
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <label
                          htmlFor="single"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Ponctuel
                        </label>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        field.value === 'recurring'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => field.onChange('recurring')}
                    >
                      <RadioGroupItem value="recurring" id="recurring" />
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                        <label
                          htmlFor="recurring"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Récurrent
                        </label>
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Créneau ponctuel */}
        {slotType === 'single' && (
          <FormField
            control={form.control}
            name="singleStartAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date et heure de début</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Créneau récurrent */}
        {slotType === 'recurring' && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="recurrence.rrule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Règle RRULE (RFC 5545)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: FREQ=WEEKLY;BYDAY=MO,WE,FR"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Format iCal standard (ex: FREQ=WEEKLY;BYDAY=MO)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recurrence.untilDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin de récurrence</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Separator />

        {/* Paramètres du créneau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={15}
                    max={1440}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participants max</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceEur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Moniteurs */}
        <FormField
          control={form.control}
          name="instructorIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID du moniteur principal</FormLabel>
              <FormControl>
                <Input
                  placeholder="UUID du moniteur"
                  value={field.value[0] ?? ''}
                  onChange={(e) => field.onChange([e.target.value])}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Identifiant unique du moniteur responsable du créneau
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours…
            </>
          ) : (
            'Créer les créneaux'
          )}
        </Button>
      </form>
    </Form>
  );
}
