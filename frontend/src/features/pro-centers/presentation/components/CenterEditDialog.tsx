import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from '@/core/components/ui/button';
import AddressAutocomplete from '@/core/components/AddressAutocomplete';
import { useUpdateCenter } from '../../domain/hooks/pro-center.hook';
import {
  centerEditSchema,
  type CenterEditFormData,
} from '../../domain/schemas/center-edit.schema';
import type { ProCenterEntity } from '../../domain/entities/pro-center.entity';

interface Props {
  center: ProCenterEntity | null;
  onClose: () => void;
}

export default function CenterEditDialog({ center, onClose }: Props) {
  const { updateCenter, updateCenterIsPending } = useUpdateCenter();

  const form = useForm<CenterEditFormData>({
    resolver: zodResolver(centerEditSchema),
    values: center
      ? {
          companyName: center.name,
          contactEmail: center.contactEmail,
          contactPhone: center.contactPhone,
          address: center.address,
        }
      : undefined,
  });

  const handleSubmit = (data: CenterEditFormData) => {
    if (!center) return;
    updateCenter(
      { id: center.id, data },
      {
        onSuccess: () => {
          toast.success('Centre mis à jour');
          onClose();
        },
        onError: () => toast.error('La mise à jour a échoué.'),
      },
    );
  };

  return (
    <Dialog open={!!center} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le centre</DialogTitle>
          <DialogDescription>
            Le SIRET et les justificatifs ne sont pas modifiables : ils fondent
            la validation de votre dossier.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la société</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contact</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rue</FormLabel>
                  <FormControl>
                    <AddressAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      onSelect={(address) => {
                        field.onChange(address.street);
                        form.setValue('address.postalCode', address.postalCode);
                        form.setValue('address.city', address.city);
                      }}
                      placeholder="12 rue des Alpes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" maxLength={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateCenterIsPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updateCenterIsPending}>
                {updateCenterIsPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
