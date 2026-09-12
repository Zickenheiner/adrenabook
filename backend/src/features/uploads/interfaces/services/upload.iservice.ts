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
   * Metadonnees d'un fichier, sans controle de droit.
   *
   * Reserve aux appelants qui ont deja etabli que le fichier est publiquement
   * exposable — aujourd'hui la photo d'une activite publiee. Pour tout le
   * reste, passer par getForReader().
   */
  findPublicById(id: string): Promise<UploadEntity | null>;

  /**
   * Flux de lecture du contenu.
   */
  openDownloadStream(id: string): Readable;
}
