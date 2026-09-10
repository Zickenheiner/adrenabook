import type { UploadedDocumentEntity } from '../entities/upload.entity';

export interface UploadRepository {
  upload(file: File): Promise<UploadedDocumentEntity>;
}
