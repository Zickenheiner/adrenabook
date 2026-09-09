import { Readable } from 'stream';
import { UploadEntity } from '@features/uploads/domains/entities/upload.entity';
import { UploadedFileLike } from '@features/uploads/domains/dtos/upload.dto';

export interface IUploadRepository {
  /**
   * Persiste le fichier et renvoie son entite.
   */
  save(file: UploadedFileLike, ownerId: string): Promise<UploadEntity | null>;

  /**
   * Metadonnees du fichier, sans son contenu. null si inexistant.
   */
  findById(id: string): Promise<UploadEntity | null>;

  /**
   * Flux de lecture du contenu. A n'appeler qu'apres findById.
   */
  openDownloadStream(id: string): Readable;
}
