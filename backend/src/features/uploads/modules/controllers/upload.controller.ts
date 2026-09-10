import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IUploadService } from '@features/uploads/interfaces/services/upload.iservice';
import {
  MAX_UPLOAD_SIZE_BYTES,
  UploadResponseDto,
  UploadedFileLike,
} from '@features/uploads/domains/dtos/upload.dto';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadController {
  constructor(
    @Inject('IUploadService')
    private readonly uploadService: IUploadService,
  ) {}

  @ApiOperation({
    summary: 'Déposer un justificatif',
    description:
      "Dépose un fichier et renvoie son identifiant, à reporter dans le dossier d'inscription " +
      "d'un centre professionnel (US-04 : extrait Kbis, attestation RC Pro, diplômes d'encadrants). " +
      'Formats acceptés : PDF, JPEG, PNG. Taille maximale : 5 Mo.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Fichier déposé',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Format de fichier non accepté' })
  @ApiResponse({ status: 413, description: 'Fichier trop volumineux (> 5 Mo)' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_SIZE_BYTES } }),
  )
  async upload(
    @UploadedFile() file: UploadedFileLike,
    @Req() req: { user: { sub: string } },
  ): Promise<UploadResponseDto> {
    return this.uploadService.upload(file, req.user.sub);
  }

  @ApiOperation({
    summary: 'Télécharger un justificatif',
    description:
      'Renvoie le contenu du fichier. Accessible au déposant lui-même et aux ' +
      'administrateurs, qui doivent pouvoir instruire un dossier KYC (US-23). Toute autre ' +
      'demande est refusée.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant du fichier', type: String })
  @ApiResponse({ status: 200, description: 'Contenu du fichier' })
  @ApiResponse({ status: 403, description: 'Accès refusé à ce fichier' })
  @ApiResponse({ status: 404, description: 'Fichier introuvable' })
  @Get(':id')
  async download(
    @Param('id') id: string,
    @Req() req: { user: { sub: string; role: string } },
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.uploadService.getForReader(
      id,
      req.user.sub,
      req.user.role,
    );

    res.setHeader('Content-Type', file.getMimeType());
    res.setHeader('Content-Length', file.getSizeBytes());
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.getFilename())}"`,
    );

    this.uploadService.openDownloadStream(id).pipe(res);
  }
}
