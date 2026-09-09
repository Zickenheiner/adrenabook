import { Readable } from 'stream';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { UploadService } from './upload.service';
import { UploadEntity } from '@features/uploads/domains/entities/upload.entity';
import {
  MAX_UPLOAD_SIZE_BYTES,
  UploadedFileLike,
} from '@features/uploads/domains/dtos/upload.dto';

const OWNER_ID = '68b4d59919d9b7a94b4fde21';
const FILE_ID = '68b4d59919d9b7a94b4fde22';

const buildFile = (
  overrides: Partial<UploadedFileLike> = {},
): UploadedFileLike => ({
  originalname: 'kbis.pdf',
  mimetype: 'application/pdf',
  size: 1024,
  buffer: Buffer.from('pdf'),
  ...overrides,
});

const buildEntity = (ownerId = OWNER_ID): UploadEntity =>
  new UploadEntity(
    new mongoose.Types.ObjectId(FILE_ID),
    'kbis.pdf',
    'application/pdf',
    1024,
    new mongoose.Types.ObjectId(ownerId),
    new Date('2026-03-01T10:00:00.000Z'),
  );

describe('UploadService', () => {
  let service: UploadService;
  let repository: {
    save: jest.Mock;
    findById: jest.Mock;
    openDownloadStream: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      openDownloadStream: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: 'IUploadRepository', useValue: repository },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload()', () => {
    it('should store the file and return its metadata', async () => {
      repository.save.mockResolvedValue(buildEntity());
      const file = buildFile();

      const result = await service.upload(file, OWNER_ID);

      expect(repository.save).toHaveBeenCalledWith(file, OWNER_ID);
      expect(result).toEqual({
        fileId: FILE_ID,
        filename: 'kbis.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
      });
    });

    it('should accept a JPEG image', async () => {
      repository.save.mockResolvedValue(buildEntity());

      await expect(
        service.upload(buildFile({ mimetype: 'image/jpeg' }), OWNER_ID),
      ).resolves.toBeDefined();
    });

    it('should accept a PNG image', async () => {
      repository.save.mockResolvedValue(buildEntity());

      await expect(
        service.upload(buildFile({ mimetype: 'image/png' }), OWNER_ID),
      ).resolves.toBeDefined();
    });

    it('should throw BadRequestException when no file is provided', async () => {
      await expect(
        service.upload(undefined as unknown as UploadedFileLike, OWNER_ID),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on a rejected mime type', async () => {
      await expect(
        service.upload(
          buildFile({ mimetype: 'application/x-msdownload' }),
          OWNER_ID,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw PayloadTooLargeException above the 5 MB limit', async () => {
      await expect(
        service.upload(
          buildFile({ size: MAX_UPLOAD_SIZE_BYTES + 1 }),
          OWNER_ID,
        ),
      ).rejects.toThrow(PayloadTooLargeException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should accept a file exactly at the size limit', async () => {
      repository.save.mockResolvedValue(buildEntity());

      await expect(
        service.upload(buildFile({ size: MAX_UPLOAD_SIZE_BYTES }), OWNER_ID),
      ).resolves.toBeDefined();
    });

    it('should throw BadRequestException when the repository returns nothing', async () => {
      repository.save.mockResolvedValue(null);

      await expect(service.upload(buildFile(), OWNER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should propagate a repository failure', async () => {
      repository.save.mockRejectedValue(new Error('gridfs error'));

      await expect(service.upload(buildFile(), OWNER_ID)).rejects.toThrow(
        'gridfs error',
      );
    });
  });

  describe('getForReader()', () => {
    it('should throw NotFoundException when the file does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.getForReader(FILE_ID, OWNER_ID, 'professionnel'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return the file to its owner', async () => {
      const entity = buildEntity();
      repository.findById.mockResolvedValue(entity);

      await expect(
        service.getForReader(FILE_ID, OWNER_ID, 'professionnel'),
      ).resolves.toBe(entity);
      expect(repository.findById).toHaveBeenCalledWith(FILE_ID);
    });

    it('should return the file to an admin who is not the owner', async () => {
      const entity = buildEntity();
      repository.findById.mockResolvedValue(entity);

      await expect(
        service.getForReader(FILE_ID, 'other-user', 'admin'),
      ).resolves.toBe(entity);
    });

    it('should throw ForbiddenException for a third party', async () => {
      repository.findById.mockResolvedValue(buildEntity());

      await expect(
        service.getForReader(FILE_ID, 'other-user', 'client'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('openDownloadStream()', () => {
    it('should delegate to the repository', () => {
      const stream = Readable.from(['content']);
      repository.openDownloadStream.mockReturnValue(stream);

      const result = service.openDownloadStream(FILE_ID);

      expect(repository.openDownloadStream).toHaveBeenCalledWith(FILE_ID);
      expect(result).toBe(stream);
    });
  });
});
