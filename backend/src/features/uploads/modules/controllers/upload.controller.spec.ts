import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { UploadController } from './upload.controller';
import { IUploadService } from '@features/uploads/interfaces/services/upload.iservice';
import { UploadEntity } from '@features/uploads/domains/entities/upload.entity';
import {
  UploadResponseDto,
  UploadedFileLike,
} from '@features/uploads/domains/dtos/upload.dto';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: jest.Mocked<IUploadService>;

  const userId = '68b4d59919d9b7a94b4fde10';
  const fileId = '68b4d59919d9b7a94b4fde21';

  // Requete authentifiee minimale telle que fournie par le guard JWT
  const buildRequest = (
    sub: string,
    role: string,
  ): { user: { sub: string; role: string } } => ({
    user: { sub, role },
  });

  // Reponse Express reduite aux methodes consommees par le controller
  const buildResponse = (): Response & { setHeader: jest.Mock } =>
    ({
      setHeader: jest.fn(),
    }) as unknown as Response & { setHeader: jest.Mock };

  const buildFile = (
    overrides: Partial<UploadedFileLike> = {},
  ): UploadedFileLike => ({
    originalname: 'kbis-alpes-aventures.pdf',
    mimetype: 'application/pdf',
    size: 148223,
    buffer: Buffer.from('contenu'),
    ...overrides,
  });

  beforeEach(async () => {
    const uploadServiceMock: jest.Mocked<IUploadService> = {
      upload: jest.fn(),
      getForReader: jest.fn(),
      openDownloadStream: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: 'IUploadService',
          useValue: uploadServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get('IUploadService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload()', () => {
    const expected: UploadResponseDto = {
      fileId,
      filename: 'kbis-alpes-aventures.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 148223,
    };

    it('should store the file for the authenticated user', async () => {
      uploadService.upload.mockResolvedValue(expected);
      const file = buildFile();

      const result = await controller.upload(
        file,
        buildRequest(userId, 'professional'),
      );

      expect(result).toEqual(expected);
      expect(uploadService.upload).toHaveBeenCalledWith(file, userId);
      expect(uploadService.upload).toHaveBeenCalledTimes(1);
    });

    it('should forward the owner id read from the request', async () => {
      uploadService.upload.mockResolvedValue(expected);

      await controller.upload(buildFile(), buildRequest('other-user', 'user'));

      expect(uploadService.upload).toHaveBeenCalledWith(
        expect.anything(),
        'other-user',
      );
    });

    it('should propagate a BadRequestException when the mime type is refused', async () => {
      uploadService.upload.mockRejectedValue(
        new BadRequestException('Format de fichier non accepté'),
      );

      await expect(
        controller.upload(
          buildFile({ mimetype: 'application/zip' }),
          buildRequest(userId, 'professional'),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate a BadRequestException when no file is provided', async () => {
      uploadService.upload.mockRejectedValue(
        new BadRequestException('Aucun fichier fourni'),
      );

      await expect(
        controller.upload(
          undefined as unknown as UploadedFileLike,
          buildRequest(userId, 'professional'),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate a PayloadTooLargeException when the file exceeds 5 MB', async () => {
      uploadService.upload.mockRejectedValue(
        new PayloadTooLargeException('Fichier trop volumineux'),
      );

      await expect(
        controller.upload(
          buildFile({ size: 6 * 1024 * 1024 }),
          buildRequest(userId, 'professional'),
        ),
      ).rejects.toThrow(PayloadTooLargeException);
    });
  });

  describe('download()', () => {
    const buildEntity = (): UploadEntity =>
      new UploadEntity(
        new mongoose.Types.ObjectId(fileId),
        'kbis-alpes-aventures.pdf',
        'application/pdf',
        148223,
        new mongoose.Types.ObjectId(userId),
        new Date('2026-06-15T09:00:00.000Z'),
      );

    it('should set the content headers and pipe the file stream', async () => {
      uploadService.getForReader.mockResolvedValue(buildEntity());
      const pipe = jest.fn();
      uploadService.openDownloadStream.mockReturnValue({
        pipe,
      } as unknown as Readable);
      const res = buildResponse();

      await controller.download(fileId, buildRequest(userId, 'user'), res);

      expect(uploadService.getForReader).toHaveBeenCalledWith(
        fileId,
        userId,
        'user',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Length', 148223);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline; filename="kbis-alpes-aventures.pdf"',
      );
      expect(uploadService.openDownloadStream).toHaveBeenCalledWith(fileId);
      expect(pipe).toHaveBeenCalledWith(res);
    });

    it('should url-encode a filename containing special characters', async () => {
      uploadService.getForReader.mockResolvedValue(
        new UploadEntity(
          new mongoose.Types.ObjectId(fileId),
          'diplôme encadrant.pdf',
          'application/pdf',
          100,
          new mongoose.Types.ObjectId(userId),
          new Date('2026-06-15T09:00:00.000Z'),
        ),
      );
      uploadService.openDownloadStream.mockReturnValue({
        pipe: jest.fn(),
      } as unknown as Readable);
      const res = buildResponse();

      await controller.download(fileId, buildRequest(userId, 'user'), res);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent('diplôme encadrant.pdf')}"`,
      );
    });

    it('should let an administrator read a file owned by someone else', async () => {
      uploadService.getForReader.mockResolvedValue(buildEntity());
      uploadService.openDownloadStream.mockReturnValue({
        pipe: jest.fn(),
      } as unknown as Readable);

      await controller.download(
        fileId,
        buildRequest('admin-id', 'admin'),
        buildResponse(),
      );

      expect(uploadService.getForReader).toHaveBeenCalledWith(
        fileId,
        'admin-id',
        'admin',
      );
    });

    it('should propagate a ForbiddenException and never open the stream', async () => {
      uploadService.getForReader.mockRejectedValue(
        new ForbiddenException('Accès refusé à ce fichier'),
      );
      const res = buildResponse();

      await expect(
        controller.download(fileId, buildRequest('intruder', 'user'), res),
      ).rejects.toThrow(ForbiddenException);
      expect(uploadService.openDownloadStream).not.toHaveBeenCalled();
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it('should propagate a NotFoundException when the file does not exist', async () => {
      uploadService.getForReader.mockRejectedValue(
        new NotFoundException('Fichier introuvable'),
      );

      await expect(
        controller.download(
          'unknown',
          buildRequest(userId, 'user'),
          buildResponse(),
        ),
      ).rejects.toThrow(NotFoundException);
      expect(uploadService.openDownloadStream).not.toHaveBeenCalled();
    });
  });
});
