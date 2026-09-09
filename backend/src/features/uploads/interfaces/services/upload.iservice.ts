import { Readable } from 'stream';
import { UploadEntity } from '@features/uploads/domains/entities/upload.entity';
import {
  UploadResponseDto,
  UploadedFileLike,
} from '@features/uploads/domains/dtos/upload.dto';

export interface IUploadService {
  /**
   * Valide (type MIME, taille) puis persiste le fichier.
   */
  upload(file: UploadedFileLike, ownerId: string): Promise<UploadResponseDto>;

  /**
   * Metadonnees d'un fichier, apres controle du droit d'acces :
   * le deposant lui-meme, ou un administrateur.
   */
  getForReader(
    id: string,
    readerId: string,
    readerRole: string,
  ): Promise<UploadEntity>;

  /**
   * Flux de lecture du contenu.
   */
  openDownloadStream(id: string): Readable;
}
