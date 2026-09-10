import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import { Textarea } from '@/core/components/ui/textarea';
import { Button } from '@/core/components/ui/button';
import {
  cancelBookingSchema,
  type CancelBookingFormData,
} from '../../domain/schemas/booking-cancellation.schema';

const REASON_LABELS: Record<string, string> = {
  personal: 'Raison personnelle',
  health: 'Problème de santé',
  weather: 'Conditions météo',
  other: 'Autre',
};

interface Props {
  onSubmit: (data: CancelBookingFormData) => void;
  isPending: boolean;
}

export default function CancellationForm({ onSubmit, isPending }: Props) {
  const form = useForm<CancelBookingFormData>({
    resolver: zodResolver(cancelBookingSchema),
    defaultValues: {
      comment: '',
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Cette action est irréversible.
              </p>
              <p className="mt-1">
                Le remboursement sera calculé selon la politique
                d&apos;annulation en vigueur : 100% si annulation &gt; J-15, 50%
                entre J-7 et J-15, aucun remboursement si &lt; J-7.
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motif d&apos;annulation *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un motif" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(REASON_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commentaire (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Précisez si nécessaire..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Annulation en cours...
              </>
            ) : (
              "Confirmer l'annulation"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
