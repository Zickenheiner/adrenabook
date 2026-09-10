import { z } from 'zod';

export const activitySearchSchema = z.object({
  query: z.string().optional(),
  type: z
    .enum([
      'bungee',
      'climbing',
      'diving',
      'paragliding',
      'canyoning',
      'via_ferrata',
    ])
    .optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radiusKm: z.number().min(1).max(500).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(50).optional(),
  sortBy: z
    .enum(['relevance', 'price_asc', 'price_desc', 'distance'])
    .optional(),
});

export type ActivitySearchFormData = z.infer<typeof activitySearchSchema>;
