import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import {
  professionalRegistrationSchema,
  type ProfessionalRegistrationFormData,
} from '../../domain/schemas/professional-registration.schema';
import DocumentUploadField from './DocumentUploadField';
import ProfessionalRegistrationStep from './ProfessionalRegistrationStep';

const STEPS = [
  { label: 'Société', description: 'Informations générales' },
  { label: 'Adresse', description: 'Localisation du centre' },
  { label: 'Représentant', description: 'Représentant légal' },
  { label: 'Documents', description: 'Pièces justificatives' },
];

interface Props {
  onSubmit: (data: ProfessionalRegistrationFormData) => void;
  isSubmitting?: boolean;
}

export default function ProfessionalRegistrationForm({
  onSubmit,
  isSubmitting,
}: Props) {
  const [step, setStep] = useState(0);

  const form = useForm<ProfessionalRegistrationFormData>({
    resolver: zodResolver(professionalRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      companyName: '',
      siret: '',
      contactEmail: '',
      contactPhone: '',
      address: { street: '', city: '', postalCode: '', country: 'France' },
      legalRepresentative: { firstName: '', lastName: '', role: '' },
      documents: { kbisFileId: '', rcProFileId: '', instructorDiplomas: [''] },
    },
  });

  const stepFields: (keyof ProfessionalRegistrationFormData)[][] = [
    ['companyName', 'siret', 'contactEmail', 'contactPhone'],
    ['address'],
    ['legalRepresentative'],
    ['documents'],
  ];

  const handleNext = async () => {
    const valid = await form.trigger(stepFields[step] as never);
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <ProfessionalRegistrationStep steps={STEPS} currentStep={step} />

        {step === 0 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la société</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Alpes Aventures SARL" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro SIRET</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="73282932000074"
                      maxLength={14}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de contact</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="contact@centre.fr"
                    />
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
                  <FormLabel>Téléphone de contact</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="+33450000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rue</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="12 rue des Alpes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="74400" maxLength={5} />
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
                      <Input {...field} placeholder="Chamonix" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="France" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="legalRepresentative.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Marie" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legalRepresentative.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dupont" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="legalRepresentative.role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle / Fonction</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Gérant" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="documents.kbisFileId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DocumentUploadField
                      label="Extrait Kbis (moins de 3 mois)"
                      value={field.value}
                      onChange={field.onChange}
                      error={
                        form.formState.errors.documents?.kbisFileId?.message
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documents.rcProFileId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DocumentUploadField
                      label="Attestation RC Professionnelle"
                      value={field.value}
                      onChange={field.onChange}
                      error={
                        form.formState.errors.documents?.rcProFileId?.message
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documents.instructorDiplomas"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DocumentUploadField
                      label="Diplôme(s) encadrant(s)"
                      value={field.value[0] ?? ''}
                      onChange={(id) => field.onChange(id ? [id] : [])}
                      error={
                        form.formState.errors.documents?.instructorDiplomas
                          ?.message
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Soumettre le dossier
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
