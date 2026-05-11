import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { AlertCircle, FileText, PenLine, ShieldCheck } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/core/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/core/components/ui/alert';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Skeleton } from '@/core/components/ui/skeleton';
import { Separator } from '@/core/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';

import routes from '@/core/constants/routes';
import { useSignWaiver } from '../../domain/hooks/waiver.hook';
import {
  signWaiverCanvasSchema,
  signWaiverOtpSchema,
  type SignWaiverCanvasFormData,
  type SignWaiverOtpFormData,
} from '../../domain/schemas/waiver.schema';
import WaiverCanvasSignature from '../components/WaiverCanvasSignature';
import WaiverOtpSignature from '../components/WaiverOtpSignature';
import WaiverSuccessCard from '../components/WaiverSuccessCard';

type SignatureMethod = 'canvas' | 'otp_sms';

export default function WaiverSignPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [method, setMethod] = useState<SignatureMethod>('canvas');

  const {
    signWaiver,
    signWaiverIsPending,
    signWaiverError,
    signedWaiver,
    signWaiverIsSuccess,
  } = useSignWaiver(bookingId ?? '');

  const canvasForm = useForm<SignWaiverCanvasFormData>({
    resolver: zodResolver(signWaiverCanvasSchema),
    defaultValues: {
      signatureMethod: 'canvas',
      signaturePayload: '',
      acknowledgedRisks: undefined,
    },
  });

  const otpForm = useForm<SignWaiverOtpFormData>({
    resolver: zodResolver(signWaiverOtpSchema),
    defaultValues: {
      signatureMethod: 'otp_sms',
      signaturePayload: '',
      acknowledgedRisks: undefined,
    },
  });

  if (!bookingId) {
    return <WaiverSignError message="Identifiant de réservation manquant." />;
  }

  if (signWaiverIsSuccess && signedWaiver) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <WaiverSuccessCard waiver={signedWaiver} />
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate(routes.bookingConfirmation.replace(':id', bookingId))
            }
          >
            Retour à la réservation
          </Button>
        </motion.div>
      </div>
    );
  }

  function onSubmitCanvas(data: SignWaiverCanvasFormData) {
    signWaiver(data);
  }

  function onSubmitOtp(data: SignWaiverOtpFormData) {
    signWaiver(data);
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              Décharge de responsabilité
            </h1>
            <p className="text-sm text-muted-foreground">
              Signature électronique requise avant l'activité
            </p>
          </div>
        </div>

        <Separator />

        {/* Legal notice */}
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Valeur légale certifiée</AlertTitle>
          <AlertDescription>
            Cette signature est conforme au règlement eIDAS (niveau simple). Le
            document sera archivé avec un horodatage qualifié et une empreinte
            SHA-256 garantissant son intégrité.
          </AlertDescription>
        </Alert>

        {/* Signature card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Choisissez votre mode de signature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={method}
              onValueChange={(v) => setMethod(v as SignatureMethod)}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="canvas" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  Signature manuscrite
                </TabsTrigger>
                <TabsTrigger value="otp_sms" className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Code SMS
                </TabsTrigger>
              </TabsList>

              {/* Canvas method */}
              <TabsContent value="canvas">
                <Form {...canvasForm}>
                  <form
                    onSubmit={canvasForm.handleSubmit(onSubmitCanvas)}
                    className="space-y-6"
                  >
                    <FormField
                      control={canvasForm.control}
                      name="signaturePayload"
                      render={() => (
                        <FormItem>
                          <FormLabel>Votre signature</FormLabel>
                          <FormControl>
                            <WaiverCanvasSignature
                              disabled={signWaiverIsPending}
                              onChange={(base64) => {
                                canvasForm.setValue(
                                  'signaturePayload',
                                  base64 ?? '',
                                  { shouldValidate: true },
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <RisksCheckbox
                      form={canvasForm}
                      disabled={signWaiverIsPending}
                    />
                    <SubmitArea
                      isPending={signWaiverIsPending}
                      error={signWaiverError}
                    />
                  </form>
                </Form>
              </TabsContent>

              {/* OTP method */}
              <TabsContent value="otp_sms">
                <Form {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(onSubmitOtp)}
                    className="space-y-6"
                  >
                    <FormField
                      control={otpForm.control}
                      name="signaturePayload"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <WaiverOtpSignature
                              disabled={signWaiverIsPending}
                              onChange={(otp) => {
                                otpForm.setValue(
                                  'signaturePayload',
                                  otp ?? '',
                                  { shouldValidate: true },
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <RisksCheckbox
                      form={otpForm}
                      disabled={signWaiverIsPending}
                    />
                    <SubmitArea
                      isPending={signWaiverIsPending}
                      error={signWaiverError}
                    />
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface RisksCheckboxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  disabled?: boolean;
}

function RisksCheckbox({ form, disabled }: RisksCheckboxProps) {
  return (
    <FormField
      control={form.control}
      name="acknowledgedRisks"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border p-4">
          <FormControl>
            <Checkbox
              checked={field.value === true}
              onCheckedChange={(checked) =>
                field.onChange(checked === true ? true : undefined)
              }
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1">
            <FormLabel className="cursor-pointer text-sm font-medium leading-snug">
              J'ai lu et j'accepte la décharge de responsabilité
            </FormLabel>
            <p className="text-xs text-muted-foreground">
              Je reconnais avoir pris connaissance des risques liés à l'activité
              et décharge l'organisateur de toute responsabilité en cas
              d'accident résultant de ma propre négligence.
            </p>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

interface SubmitAreaProps {
  isPending: boolean;
  error: Error | null;
}

function SubmitArea({ isPending, error }: SubmitAreaProps) {
  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error.message ??
              'Une erreur est survenue lors de la signature. Veuillez réessayer.'}
          </AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Signature en cours…' : 'Signer la décharge'}
      </Button>
    </div>
  );
}

function WaiverSignError({ message }: { message: string }) {
  return (
    <div className="container mx-auto max-w-xl px-4 py-10">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

function WaiverSignSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export { WaiverSignSkeleton };
