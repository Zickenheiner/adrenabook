import { Readable } from 'stream';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { IUploadService } from '@features/uploads/interfaces/services/upload.iservice';
import { IUploadRepository } from '@features/uploads/interfaces/repositories/upload.irepository';
import { UploadEntity } from '@features/uploads/domains/entities/upload.entity';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  UploadResponseDto,
  UploadedFileLike,
} from '@features/uploads/domains/dtos/upload.dto';

@Injectable()
export class UploadService implements IUploadService {
  constructor(
    @Inject('IUploadRepository')
    private readonly uploadRepository: IUploadRepository,
  ) {}

  async upload(
    file: UploadedFileLike,
    ownerId: string,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (
      !ALLOWED_UPLOAD_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        `Format non accepté : ${file.mimetype}. Formats autorisés : PDF, JPEG, PNG.`,
      );
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `Fichier trop volumineux (${Math.round(file.size / 1024)} Ko). Maximum : 5 Mo.`,
      );
    }

    const saved = await this.uploadRepository.save(file, ownerId);
    if (!saved) {
      throw new BadRequestException("Le dépôt du fichier n'a pas abouti");
    }

    return {
      fileId: saved.getId(),
      filename: saved.getFilename(),
      mimeType: saved.getMimeType(),
      sizeBytes: saved.getSizeBytes(),
    };
  }

  async getForReader(
    id: string,
    readerId: string,
    readerRole: string,
  ): Promise<UploadEntity> {
    const file = await this.uploadRepository.findById(id);
    if (!file) {
      throw new NotFoundException('Fichier introuvable');
    }

    // Un justificatif KYC n'est lisible que par son deposant et par un
    // administrateur, qui doit pouvoir instruire le dossier (US-23).
    const estDeposant = file.getOwnerId() === readerId;
    const estAdmin = readerRole === 'admin';

    if (!estDeposant && !estAdmin) {
      throw new ForbiddenException('Accès refusé à ce fichier');
    }

    return file;
  }

  openDownloadStream(id: string): Readable {
    return this.uploadRepository.openDownloadStream(id);
  }
}
