export type UserRole = 'aventurier' | 'professionnel' | 'admin';

export interface LoginRequestDto {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface LoginResponseUserDto {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: LoginResponseUserDto;
}
