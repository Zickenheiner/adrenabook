import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Textarea } from '@/core/components/ui/textarea';
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
import { cn } from '@/core/utils/cn';
import {
  centerReviewSchema,
  type CenterReviewFormData,
} from '../../domain/schemas/center-review.schema';

interface Props {
  onSubmit: (data: CenterReviewFormData) => void;
  isSubmitting?: boolean;
}

const DECISION_OPTIONS = [
  {
    value: 'approve',
    label: 'Approuver',
    icon: CheckCircle,
    className: 'text-success',
  },
  {
    value: 'reject',
    label: 'Refuser',
    icon: XCircle,
    className: 'text-destructive',
  },
  {
    value: 'request_more_info',
    label: 'Demander des informations complémentaires',
    icon: HelpCircle,
    className: 'text-warning',
  },
] as const;

const REJECTION_REASON_OPTIONS = [
  { value: 'incomplete_kbis', label: 'Kbis incomplet ou expiré' },
  { value: 'invalid_diploma', label: 'Diplôme invalide ou manquant' },
  { value: 'expired_insurance', label: 'Assurance expirée ou insuffisante' },
  { value: 'other', label: 'Autre motif' },
] as const;

export default function CenterReviewForm({ onSubmit, isSubmitting }: Props) {
  const form = useForm<CenterReviewFormData>({
    resolver: zodResolver(centerReviewSchema),
    defaultValues: {
      decision: undefined,
      internalComment: '',
      rejectionReason: undefined,
      publicComment: '',
    },
  });

  const decision = form.watch('decision');
  const needsRejectionReason = decision === 'reject';
  const needsPublicComment =
    decision === 'reject' || decision === 'request_more_info';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {/* Decision */}
        <FormField
          control={form.control}
          name="decision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Décision *</FormLabel>
              <div className="grid gap-2 sm:grid-cols-3">
                {DECISION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = field.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left',
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isSelected ? 'text-primary' : option.className,
                        )}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rejection reason */}
        {needsRejectionReason && (
          <FormField
            control={form.control}
            name="rejectionReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motif de refus *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un motif" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REJECTION_REASON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Public comment */}
        {needsPublicComment && (
          <FormField
            control={form.control}
            name="publicComment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commentaire envoyé au centre *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ce commentaire sera transmis au professionnel..."
                    className="resize-none"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Internal comment */}
        <FormField
          control={form.control}
          name="internalComment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note interne (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Note visible uniquement par les administrateurs..."
                  className="resize-none"
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting || !decision}
          className="w-full"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Valider la décision
        </Button>
      </form>
    </Form>
  );
}
