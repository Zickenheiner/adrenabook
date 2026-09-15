import { ApiProperty } from '@nestjs/swagger';

/**
 * Contraintes de depot appliquees a tout fichier justificatif.
 *
 * Le perimetre est volontairement restreint aux formats attendus pour un
 * dossier KYC (Kbis, attestation RC Pro, diplomes) : PDF et images.
 */
export const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  // Imports en masse (US-20). Les navigateurs etiquettent un .csv tantot
  // text/csv, tantot application/vnd.ms-excel selon l'OS et les logiciels
  // installes : refuser la seconde forme rejetterait des fichiers valides.
  'text/csv',
  'application/vnd.ms-excel',
] as const;

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

/**
 * Fichier recu par le controller.
 *
 * Interface locale volontaire : @types/multer n'est pas installe dans le
 * projet, et seules ces quatre proprietes sont consommees. Cela evite une
 * dependance supplementaire pour un usage aussi restreint.
 */
export interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'File identifier, to be reported in the KYC dossier',
    example: '68b4d59919d9b7a94b4fde21',
  })
  fileId: string;

  @ApiProperty({
    description: 'File name as provided at upload time',
    example: 'kbis-alpes-aventures.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'Validated MIME type of the file',
    example: 'application/pdf',
    enum: ALLOWED_UPLOAD_MIME_TYPES,
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 148223,
  })
  sizeBytes: number;
}
