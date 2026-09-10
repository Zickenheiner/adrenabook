import { z } from 'zod';

const luhnCheck = (siret: string): boolean => {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i], 10);
    if ((14 - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

export const professionalRegistrationSchema = z.object({
  companyName: z.string().min(1, 'Le nom de la société est obligatoire'),
  siret: z
    .string()
    .regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres')
    .refine(luhnCheck, {
      message: 'Le numéro SIRET est invalide (contrôle Luhn)',
    }),
  contactEmail: z
    .string()
    .min(1, "L'email de contact est obligatoire")
    .email("Format d'email invalide"),
  contactPhone: z
    .string()
    .min(1, 'Le téléphone de contact est obligatoire')
    .regex(/^\+?[\d\s\-().]{8,20}$/, 'Format de téléphone invalide'),
  address: z.object({
    street: z.string().min(1, 'La rue est obligatoire'),
    city: z.string().min(1, 'La ville est obligatoire'),
    postalCode: z
      .string()
      .min(1, 'Le code postal est obligatoire')
      .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),
    country: z.string().min(1, 'Le pays est obligatoire'),
  }),
  legalRepresentative: z.object({
    firstName: z.string().min(1, 'Le prénom est obligatoire'),
    lastName: z.string().min(1, 'Le nom est obligatoire'),
    role: z.string().min(1, 'Le rôle est obligatoire'),
  }),
  documents: z.object({
    // Obligatoires côté backend (DocumentsDto : @IsNotEmpty)
    kbisFileId: z.string().min(1, 'Le Kbis est obligatoire'),
    rcProFileId: z.string().min(1, 'La RC Pro est obligatoire'),
    // Optionnels, conformément à ce que l'étape 4 annonce à l'utilisateur
    instructorDiplomas: z.array(z.string().min(1)),
  }),
});

export type ProfessionalRegistrationFormData = z.infer<
  typeof professionalRegistrationSchema
>;
