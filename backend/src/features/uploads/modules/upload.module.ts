import { Module } from '@nestjs/common';
import { UploadController } from '@features/uploads/modules/controllers/upload.controller';
import { UploadService } from '@features/uploads/modules/implementation/services/upload.service';
import { UploadRepository } from '@features/uploads/modules/implementation/repositories/upload.repository';

/**
 * Depot de justificatifs (Kbis, RC Pro, diplomes) utilise par l'inscription
 * d'un centre professionnel (US-04) et par son instruction cote administrateur
 * (US-23).
 *
 * Aucun MongooseModule.forFeature ici : le stockage passe par GridFS, qui
 * s'appuie directement sur la connexion injectee, sans schema dedie.
 */
@Module({
  controllers: [UploadController],
  providers: [
    { provide: 'IUploadService', useClass: UploadService },
    { provide: 'IUploadRepository', useClass: UploadRepository },
  ],
  exports: ['IUploadService'],
})
export class UploadModule {}
