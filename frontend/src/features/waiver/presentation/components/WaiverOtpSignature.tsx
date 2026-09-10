import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import { MessageSquare } from 'lucide-react';

const otpFieldSchema = z.object({
  otp: z
    .string()
    .length(6, 'Le code OTP doit contenir 6 chiffres')
    .regex(/^\d{6}$/, 'Le code OTP ne doit contenir que des chiffres'),
});

type OtpFieldData = z.infer<typeof otpFieldSchema>;

interface Props {
  onChange: (otp: string | null) => void;
  disabled?: boolean;
}

export default function WaiverOtpSignature({ onChange, disabled }: Props) {
  const form = useForm<OtpFieldData>({
    resolver: zodResolver(otpFieldSchema),
    defaultValues: { otp: '' },
    mode: 'onChange',
  });

  function handleChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    form.setValue('otp', digits, { shouldValidate: true });
    if (digits.length === 6) {
      onChange(digits);
    } else {
      onChange(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-4">
        <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Un code à 6 chiffres a été envoyé par SMS au numéro associé à votre
          compte. Saisissez-le ci-dessous pour valider votre signature.
        </p>
      </div>
      <Form {...form}>
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code OTP</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  disabled={disabled}
                  className="max-w-[180px] text-center text-lg tracking-widest"
                  onChange={(e) => handleChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </div>
  );
}
