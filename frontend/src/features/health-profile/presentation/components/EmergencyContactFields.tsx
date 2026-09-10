import type { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import type { HealthProfileFormData } from '../../domain/hooks/health-profile.hook';

interface Props {
  control: Control<HealthProfileFormData>;
}

export default function EmergencyContactFields({ control }: Props) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="emergencyContact.fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom complet</FormLabel>
            <FormControl>
              <Input placeholder="Jean Dupont" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="emergencyContact.relation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Relation</FormLabel>
            <FormControl>
              <Input placeholder="Conjoint(e), parent, ami(e)..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="emergencyContact.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numéro de téléphone</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="+33 6 12 34 56 78" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
