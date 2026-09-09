import { Readable } from 'stream';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { IUploadRepository } from '@features/uploads/interfaces/repositories/upload.irepository';
import { UploadEntity } from '@features/uploads/domains/entities/upload.entity';
import { UploadedFileLike } from '@features/uploads/domains/dtos/upload.dto';

const BUCKET_NAME = 'uploads';

interface UploadMetadata {
  ownerId: mongoose.Types.ObjectId;
  mimeType: string;
}

/**
 * Stockage des justificatifs dans GridFS.
 *
 * Choix assume : GridFS reutilise la connexion MongoDB deja etablie, donc
 * aucun volume Docker ni service de stockage objet supplementaire a declarer
 * et a sauvegarder. Les fichiers suivent le meme cycle de vie et la meme
 * politique de sauvegarde que le reste des donnees.
 */
@Injectable()
export class UploadRepository implements IUploadRepository {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  private bucket(): mongoose.mongo.GridFSBucket {
    return new mongoose.mongo.GridFSBucket(this.connection.db!, {
      bucketName: BUCKET_NAME,
    });
  }

  async save(
    file: UploadedFileLike,
    ownerId: string,
  ): Promise<UploadEntity | null> {
    const metadata: UploadMetadata = {
      ownerId: new mongoose.Types.ObjectId(ownerId),
      mimeType: file.mimetype,
    };

    const stream = this.bucket().openUploadStream(file.originalname, {
      metadata,
    });

    return new Promise<UploadEntity | null>((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', () => {
        resolve(
          new UploadEntity(
            stream.id as mongoose.Types.ObjectId,
            file.originalname,
            file.mimetype,
            file.size,
            metadata.ownerId,
            new Date(),
          ),
        );
      });
      stream.end(file.buffer);
    });
  }

  async findById(id: string): Promise<UploadEntity | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const files = await this.bucket()
      .find({ _id: new mongoose.Types.ObjectId(id) })
      .toArray();

    const file = files[0];
    if (!file) return null;

    const metadata = file.metadata as UploadMetadata | undefined;

    return new UploadEntity(
      file._id,
      file.filename,
      metadata?.mimeType ?? 'application/octet-stream',
      file.length,
      metadata?.ownerId ?? new mongoose.Types.ObjectId(),
      file.uploadDate,
    );
  }

  openDownloadStream(id: string): Readable {
    return this.bucket().openDownloadStream(new mongoose.Types.ObjectId(id));
  }
}
