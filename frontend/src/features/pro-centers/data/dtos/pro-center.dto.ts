export interface ProCenterResponseDto {
  id: string;
  companyName: string;
  status: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}
