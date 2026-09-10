import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Separator } from '@/core/components/ui/separator';
import { Badge } from '@/core/components/ui/badge';
import {
  createActivitySchema,
  type CreateActivityFormData,
} from '../../domain/schemas/activity.schema';

interface Props {
  defaultValues?: Partial<CreateActivityFormData>;
  onSubmit: (data: CreateActivityFormData) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function ActivityForm({
  defaultValues,
  onSubmit,
  isPending = false,
  submitLabel = "Créer l'activité",
}: Props) {
  const [equipmentInput, setEquipmentInput] = useState('');

  const form = useForm<CreateActivityFormData>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      difficulty: 'beginner',
      durationMinutes: 60,
      priceFromEur: 0,
      prerequisites: {
        minAge: 18,
        medicalCertificateRequired: false,
      },
      includedEquipment: [],
      photoFileIds: [],
      status: 'draft',
      ...defaultValues,
    },
  });

  const equipment = form.watch('includedEquipment');

  function addEquipment() {
    const trimmed = equipmentInput.trim();
    if (!trimmed) return;
    const current = form.getValues('includedEquipment');
    if (!current.includes(trimmed)) {
      form.setValue('includedEquipment', [...current, trimmed]);
    }
    setEquipmentInput('');
  }

  function removeEquipment(item: string) {
    const current = form.getValues('includedEquipment');
    form.setValue(
      'includedEquipment',
      current.filter((e) => e !== item),
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations générales */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Informations générales
          </h2>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de l&apos;activité</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex : Saut en parachute tandem"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez l'activité en détail..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d&apos;activité</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex : parachutisme, kayak..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulté</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une difficulté" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Débutant</SelectItem>
                      <SelectItem value="intermediate">
                        Intermédiaire
                      </SelectItem>
                      <SelectItem value="advanced">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? undefined
                            : e.target.valueAsNumber,
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
              name="priceFromEur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix à partir de (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? undefined
                            : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Prérequis */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Prérequis
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prerequisites.minAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Âge minimum</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? undefined
                            : e.target.valueAsNumber,
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
              name="prerequisites.maxAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Âge maximum (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      placeholder="Sans limite"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? undefined
                            : e.target.valueAsNumber,
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
              name="prerequisites.minWeightKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids minimum (kg, optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Sans limite"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? undefined
                            : e.target.valueAsNumber,
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
              name="prerequisites.maxWeightKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids maximum (kg, optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Sans limite"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? undefined
                            : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="prerequisites.medicalCertificateRequired"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">
                  Certificat médical requis
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Équipement inclus */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Équipement inclus
          </h2>

          <div className="flex gap-2">
            <Input
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addEquipment();
                }
              }}
              placeholder="Ex : casque, harnais..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addEquipment}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {equipment.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {equipment.map((item) => (
                <Badge key={item} variant="secondary" className="gap-1 pr-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeEquipment(item)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Statut */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publier</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Enregistrement...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
