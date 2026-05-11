export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  acceptCgu: boolean;
  acceptRgpd: boolean;
}

export interface RegisterResponseDto {
  userId: string;
  email: string;
  emailVerificationSent: boolean;
}
