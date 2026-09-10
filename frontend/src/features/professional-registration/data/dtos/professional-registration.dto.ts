/**
 * Contrat réel de POST /professional-center (CreateProfessionalCenterDto backend).
 * La route exige une authentification et ne renvoie pas d'identifiant :
 * la réponse est un simple booléen de succès.
 */
export interface CreateProfessionalCenterRequestDto {
  companyName: string;
  siret: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  legalRepresentative: {
    firstName: string;
    lastName: string;
    role: string;
  };
  documents: {
    kbisFileId: string;
    rcProFileId: string;
    instructorDiplomas: string[];
  };
}

export type CreateProfessionalCenterResponseDto = boolean;
