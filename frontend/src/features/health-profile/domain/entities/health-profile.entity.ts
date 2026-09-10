export interface EmergencyContactEntity {
  fullName: string;
  relation: string;
  phone: string;
}

export interface HealthProfileEntity {
  updated: boolean;
  fieldsEncrypted: string[];
}

export interface HealthProfileFormEntity {
  weight?: number;
  height?: number;
  medicalContraindications?: string[];
  emergencyContact: EmergencyContactEntity;
  medicalCertificateFileId?: string;
}
