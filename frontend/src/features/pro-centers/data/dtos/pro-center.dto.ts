export interface ProCenterResponseDto {
  id: string;
  companyName: string;
  status: string;
  activitiesCount: number;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}
