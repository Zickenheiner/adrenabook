export interface PasswordResetConfirmRequestDto {
  token: string;
  newPassword: string;
}

export interface PasswordResetConfirmResponseDto {
  message: string;
}
