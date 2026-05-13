import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Button } from '@/core/components/ui/button';
import { Alert, AlertDescription } from '@/core/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  rgpdDeleteSchema,
  type RgpdDeleteFormData,
} from '../../domain/schemas/rgpd.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: RgpdDeleteFormData) => void;
  isPending: boolean;
}

export default function RgpdDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: Props) {
  const form = useForm<RgpdDeleteFormData>({
    resolver: zodResolver(rgpdDeleteSchema),
    defaultValues: {
      confirmationCode: '',
      reason: '',
    },
  });

  function handleSubmit(data: RgpdDeleteFormData) {
    onConfirm(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Demander la suppression de mon compte
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Vos données seront anonymisées dans
            un délai de 30 jours.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Un code de confirmation vous a été envoyé par email. Veuillez le
            saisir ci-dessous pour confirmer votre demande.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="confirmationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code de confirmation</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Entrez le code reçu par email"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Pourquoi souhaitez-vous supprimer votre compte ?"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement…
                  </>
                ) : (
                  'Confirmer la suppression'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
