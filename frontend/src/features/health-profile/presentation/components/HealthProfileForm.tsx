import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import {
  healthProfileSchema,
  type HealthProfileFormData,
  useUpdateHealthProfile,
} from '../../domain/hooks/health-profile.hook';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import { Badge } from '@/core/components/ui/badge';
import EmergencyContactFields from './EmergencyContactFields';

export default function HealthProfileForm() {
  const {
    updateHealthProfile,
    updateHealthProfileIsPending,
    updateHealthProfileIsSuccess,
    updateHealthProfileData,
  } = useUpdateHealthProfile();

  const form = useForm<HealthProfileFormData>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      weight: undefined,
      height: undefined,
      medicalContraindications: [],
      emergencyContact: {
        fullName: '',
        relation: '',
        phone: '',
      },
      medicalCertificateFileId: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error useFieldArray requires string array field workaround
    name: 'medicalContraindications',
  });

  function onSubmit(data: HealthProfileFormData) {
    updateHealthProfile({
      weight: data.weight,
      height: data.height,
      medicalContraindications: data.medicalContraindications,
      emergencyContact: data.emergencyContact,
      medicalCertificateFileId: data.medicalCertificateFileId,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Données biométriques */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-base font-semibold">Données biométriques</h2>
            <p className="text-sm text-muted-foreground">
              Informations requises pour certaines activités (saut élastique...)
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="75"
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
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taille (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="175"
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
          </div>
        </motion.div>

        <Separator />

        {/* Contre-indications médicales */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-base font-semibold">
              Contre-indications médicales
            </h2>
            <p className="text-sm text-muted-foreground">
              Informations chiffrées, accessibles uniquement au moniteur le jour
              de l&apos;activité
            </p>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`medicalContraindications.${index}`}
                  render={({ field: itemField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Ex : allergie aux piqûres d'insectes"
                          {...itemField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append('')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter une contre-indication
          </Button>
        </motion.div>

        <Separator />

        {/* Contact d'urgence */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-base font-semibold">
              Personne à prévenir en cas d&apos;urgence
            </h2>
            <p className="text-sm text-muted-foreground">
              Ces informations seront transmises aux secours si nécessaire
            </p>
          </div>
          <EmergencyContactFields control={form.control} />
        </motion.div>

        <Separator />

        {/* Résultat succès */}
        {updateHealthProfileIsSuccess && updateHealthProfileData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Profil santé mis à jour avec succès
              </p>
              {updateHealthProfileData.fieldsEncrypted.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">
                    Champs chiffrés :
                  </span>
                  {updateHealthProfileData.fieldsEncrypted.map((field) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Submit */}
        <FormField
          control={form.control}
          name="medicalCertificateFileId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Certificat médical{' '}
                <span className="text-muted-foreground">(optionnel)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="ID du fichier (téléversé séparément)"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                />
              </FormControl>
              <FormDescription>
                Requis pour certaines activités à risque élevé
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={updateHealthProfileIsPending}
        >
          {updateHealthProfileIsPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer mon profil santé'
          )}
        </Button>
      </form>
    </Form>
  );
}
