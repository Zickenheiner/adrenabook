export interface SignWaiverRequestDto {
  signatureMethod: 'canvas' | 'otp_sms';
  signaturePayload: string; // base64 canvas OR code OTP 6 chiffres
  acknowledgedRisks: boolean;
}

export interface SignWaiverResponseDto {
  waiverId: string;
  signedAt: string;
  documentHash: string; // SHA-256
  /** `null` tant qu'aucun PDF signé n'est généré côté backend */
  downloadUrl: string | null;
}
