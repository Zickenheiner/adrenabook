export interface ProCenterResponseDto {
  id: string;
  companyName: string;
  status: string;
  activitiesCount: number;
  contactEmail?: string;
  contactPhone?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface UpdateCenterRequestDto {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}
