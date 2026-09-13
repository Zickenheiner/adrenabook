export interface AccountResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string; // ISO 8601
  role: string;
  status: string;
}
