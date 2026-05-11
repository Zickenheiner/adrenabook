import { z } from 'zod';

export const centerReviewSchema = z
  .object({
    decision: z.enum(['approve', 'reject', 'request_more_info'], {
      required_error: 'Une décision est requise',
    }),
    internalComment: z.string().optional(),
    rejectionReason: z
      .enum([
        'incomplete_kbis',
        'invalid_diploma',
        'expired_insurance',
        'other',
      ])
      .optional(),
    publicComment: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.decision === 'reject' && !data.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message: 'Le motif de refus est obligatoire',
      });
    }
    if (
      (data.decision === 'reject' || data.decision === 'request_more_info') &&
      !data.publicComment
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publicComment'],
        message: 'Un commentaire public est requis pour ce type de décision',
      });
    }
  });

export type CenterReviewFormData = z.infer<typeof centerReviewSchema>;
