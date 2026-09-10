export interface EmergencyContactDto {
  fullName: string;
  relation: string;
  phone: string;
}

export interface HealthProfileRequestDto {
  weight?: number;
  height?: number;
  medicalContraindications?: string[];
  emergencyContact: EmergencyContactDto;
  medicalCertificateFileId?: string;
}

export interface HealthProfileResponseDto {
  updated: boolean;
  fieldsEncrypted: string[];
}
