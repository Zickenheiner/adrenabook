import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

/**
 * Fichier justificatif stocke dans GridFS.
 *
 * GridFS ne passe pas par un schema Mongoose : il n'y a donc volontairement
 * pas de fichier .schema.ts ni de mapper Document -> Entity pour cette
 * feature. L'entite est construite directement depuis les metadonnees du
 * bucket, par le repository.
 */
export class UploadEntity {
  @ApiProperty({
    example: '68b4d59919d9b7a94b4fde21',
    description: 'Identifiant du fichier dans GridFS',
  })
  private readonly id: mongoose.Types.ObjectId;

  private filename: string;
  private mimeType: string;
  private sizeBytes: number;
  private ownerId: mongoose.Types.ObjectId;
  private uploadedAt: Date;

  constructor(
    id: mongoose.Types.ObjectId,
    filename: string,
    mimeType: string,
    sizeBytes: number,
    ownerId: mongoose.Types.ObjectId,
    uploadedAt: Date,
  ) {
    this.id = id;
    this.filename = filename;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
    this.ownerId = ownerId;
    this.uploadedAt = uploadedAt;
  }

  // ———————GETTER———————

  getId(): string {
    return this.id.toString();
  }

  getFilename(): string {
    return this.filename;
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getSizeBytes(): number {
    return this.sizeBytes;
  }

  getOwnerId(): string {
    return this.ownerId.toString();
  }

  getUploadedAt(): Date {
    return this.uploadedAt;
  }
}
