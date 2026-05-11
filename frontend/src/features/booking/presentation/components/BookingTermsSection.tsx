import { useFormContext } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/core/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import type { CreateBookingFormData } from '../../domain/schemas/booking.schema';

export default function BookingTermsSection() {
  const form = useFormContext<CreateBookingFormData>();

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        <span>Conditions du centre</span>
      </div>

      <FormField
        control={form.control}
        name="acceptCenterTerms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-normal cursor-pointer">
                J'accepte les conditions générales du centre sportif, notamment
                les règles de sécurité, les prérequis physiques et la politique
                d'annulation.
              </FormLabel>
              <FormMessage className="text-xs" />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
