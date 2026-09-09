import UploadApi from '../datasources/upload.api';
import UploadMapper from '../mappers/upload.mapper';
import type { UploadRepository } from '../../domain/repositories/upload.repository';
import type { UploadedDocumentEntity } from '../../domain/entities/upload.entity';

class UploadRepositoryImpl implements UploadRepository {
  private readonly api = new UploadApi();
  private readonly mapper = new UploadMapper();

  async upload(file: File): Promise<UploadedDocumentEntity> {
    const dto = await this.api.upload(file);
    return this.mapper.toEntity(dto);
  }
}

export default UploadRepositoryImpl;
