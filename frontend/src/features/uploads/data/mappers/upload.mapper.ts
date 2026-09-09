import type { UploadResponseDto } from '../dtos/upload.dto';
import type { UploadedDocumentEntity } from '../../domain/entities/upload.entity';

class UploadMapper {
  toEntity(dto: UploadResponseDto): UploadedDocumentEntity {
    return {
      fileId: dto.fileId,
      filename: dto.filename,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
    };
  }
}

export default UploadMapper;
