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
    summary: 'Upload a supporting document',
    description:
      'Uploads a file and returns its identifier, to be reported in the registration ' +
      'dossier of a professional center (Kbis extract, professional liability ' +
      'insurance certificate, instructor diplomas). ' +
      'Accepted formats: PDF, JPEG, PNG. Maximum size: 5 MB.',
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
    description: 'File uploaded',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'File format not accepted' })
  @ApiResponse({ status: 413, description: 'File too large (> 5 MB)' })
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
    summary: 'Download a supporting document',
    description:
      'Returns the file content. Accessible to the uploader themselves and to ' +
      'administrators, who must be able to review a KYC dossier. Any other ' +
      'request is denied.',
  })
  @ApiParam({ name: 'id', description: 'File identifier', type: String })
  @ApiResponse({ status: 200, description: 'File content' })
  @ApiResponse({ status: 403, description: 'Access to this file denied' })
  @ApiResponse({ status: 404, description: 'File not found' })
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
