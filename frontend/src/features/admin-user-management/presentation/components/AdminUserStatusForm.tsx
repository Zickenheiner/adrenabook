import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateUserStatusSchema,
  type UpdateUserStatusFormData,
} from '../../domain/schemas/admin-user.schema';
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
import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Props {
  currentStatus: 'active' | 'suspended' | 'banned';
  onSubmit: (data: UpdateUserStatusFormData) => void;
  isPending?: boolean;
}

export default function AdminUserStatusForm({
  currentStatus,
  onSubmit,
  isPending = false,
}: Props) {
  const form = useForm<UpdateUserStatusFormData>({
    resolver: zodResolver(updateUserStatusSchema),
    defaultValues: {
      status: currentStatus,
      reason: '',
      durationDays: undefined,
    },
  });

  const watchedStatus = form.watch('status');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="banned">Banni</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justificatif (obligatoire)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Expliquez la raison de ce changement de statut..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedStatus === 'suspended' && (
          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée de suspension (jours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    placeholder="Ex: 30"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmer le changement de statut
        </Button>
      </form>
    </Form>
  );
}
