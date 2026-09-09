import { z } from 'zod';

export const signWaiverCanvasSchema = z.object({
  signatureMethod: z.literal('canvas'),
  signaturePayload: z.string().min(1, 'La signature est requise'),
  acknowledgedRisks: z.boolean().refine((v) => v === true, {
    message: 'Vous devez accepter les risques pour continuer',
  }),
});

export const signWaiverOtpSchema = z.object({
  signatureMethod: z.literal('otp_sms'),
  signaturePayload: z
    .string()
    .length(6, 'Le code OTP doit contenir 6 chiffres')
    .regex(/^\d{6}$/, 'Le code OTP ne doit contenir que des chiffres'),
  acknowledgedRisks: z.boolean().refine((v) => v === true, {
    message: 'Vous devez accepter les risques pour continuer',
  }),
});

export const signWaiverSchema = z.discriminatedUnion('signatureMethod', [
  signWaiverCanvasSchema,
  signWaiverOtpSchema,
]);

export type SignWaiverCanvasFormData = z.infer<typeof signWaiverCanvasSchema>;
export type SignWaiverOtpFormData = z.infer<typeof signWaiverOtpSchema>;
export type SignWaiverFormData = z.infer<typeof signWaiverSchema>;
