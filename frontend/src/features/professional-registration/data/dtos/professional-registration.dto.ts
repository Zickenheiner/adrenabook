export interface RegisterProfessionalRequestDto {
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

export interface RegisterProfessionalResponseDto {
  centerId: string;
  status: 'pending_review';
  estimatedReviewTime: string;
}
