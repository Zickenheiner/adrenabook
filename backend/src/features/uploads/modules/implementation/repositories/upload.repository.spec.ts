import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UploadRepository } from './upload.repository';
import { UploadedFileLike } from '@features/uploads/domains/dtos/upload.dto';

const OWNER_ID = '68b4d59919d9b7a94b4fde21';
const FILE_ID = '68b4d59919d9b7a94b4fde22';

// Flux d'ecriture GridFS factice : end() declenche l'evenement demande au
// prochain tick, comme le fait le driver.
class FakeUploadStream extends EventEmitter {
  public readonly id = new mongoose.Types.ObjectId(FILE_ID);
  public readonly end: jest.Mock;

  constructor(private readonly failWith?: Error) {
    super();
    this.end = jest.fn(() => {
      process.nextTick(() => {
        if (this.failWith) {
          this.emit('error', this.failWith);
        } else {
          this.emit('finish');
        }
      });
    });
  }
}

const buildFile = (
  overrides: Partial<UploadedFileLike> = {},
): UploadedFileLike => ({
  originalname: 'kbis.pdf',
  mimetype: 'application/pdf',
  size: 2048,
  buffer: Buffer.from('pdf-bytes'),
  ...overrides,
});

describe('UploadRepository', () => {
  let repository: UploadRepository;
  let bucket: {
    openUploadStream: jest.Mock;
    find: jest.Mock;
    openDownloadStream: jest.Mock;
  };
  let bucketSpy: jest.SpyInstance;

  beforeEach(async () => {
    bucket = {
      openUploadStream: jest.fn(),
      find: jest.fn(),
      openDownloadStream: jest.fn(),
    };

    bucketSpy = jest
      .spyOn(mongoose.mongo, 'GridFSBucket')
      .mockImplementation(
        () => bucket as unknown as mongoose.mongo.GridFSBucket,
      );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadRepository,
        { provide: getConnectionToken(), useValue: { db: { name: 'test' } } },
      ],
    }).compile();

    repository = module.get<UploadRepository>(UploadRepository);
  });

  afterEach(() => {
    bucketSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save()', () => {
    it('should open a stream on the "uploads" bucket with the owner metadata', async () => {
      bucket.openUploadStream.mockReturnValue(new FakeUploadStream());

      await repository.save(buildFile(), OWNER_ID);

      expect(bucketSpy).toHaveBeenCalledWith(
        { name: 'test' },
        { bucketName: 'uploads' },
      );
      const [filename, options] = bucket.openUploadStream.mock.calls[0] as [
        string,
        { metadata: { ownerId: mongoose.Types.ObjectId; mimeType: string } },
      ];
      expect(filename).toBe('kbis.pdf');
      expect(options.metadata.ownerId.toString()).toBe(OWNER_ID);
      expect(options.metadata.mimeType).toBe('application/pdf');
    });

    it('should write the buffer and resolve an entity once the stream finishes', async () => {
      const stream = new FakeUploadStream();
      bucket.openUploadStream.mockReturnValue(stream);
      const file = buildFile();

      const result = await repository.save(file, OWNER_ID);

      expect(stream.end).toHaveBeenCalledWith(file.buffer);
      expect(result?.getId()).toBe(FILE_ID);
      expect(result?.getFilename()).toBe('kbis.pdf');
      expect(result?.getMimeType()).toBe('application/pdf');
      expect(result?.getSizeBytes()).toBe(2048);
      expect(result?.getOwnerId()).toBe(OWNER_ID);
      expect(result?.getUploadedAt()).toBeInstanceOf(Date);
    });

    it('should reject when the GridFS stream emits an error', async () => {
      bucket.openUploadStream.mockReturnValue(
        new FakeUploadStream(new Error('bucket unavailable')),
      );

      await expect(repository.save(buildFile(), OWNER_ID)).rejects.toThrow(
        'bucket unavailable',
      );
    });

    it('should throw when the owner id is not a valid ObjectId', async () => {
      await expect(repository.save(buildFile(), 'not-an-id')).rejects.toThrow();
      expect(bucket.openUploadStream).not.toHaveBeenCalled();
    });
  });

  describe('findById()', () => {
    it('should return null without querying when the id is invalid', async () => {
      const result = await repository.findById('not-an-id');

      expect(result).toBeNull();
      expect(bucket.find).not.toHaveBeenCalled();
    });

    it('should build an entity from the bucket metadata', async () => {
      const uploadDate = new Date('2026-03-01T10:00:00.000Z');
      bucket.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(FILE_ID),
            filename: 'kbis.pdf',
            length: 2048,
            uploadDate,
            metadata: {
              ownerId: new mongoose.Types.ObjectId(OWNER_ID),
              mimeType: 'application/pdf',
            },
          },
        ]),
      });

      const result = await repository.findById(FILE_ID);

      const filter = bucket.find.mock.calls[0][0] as {
        _id: mongoose.Types.ObjectId;
      };
      expect(filter._id.toString()).toBe(FILE_ID);
      expect(result?.getId()).toBe(FILE_ID);
      expect(result?.getMimeType()).toBe('application/pdf');
      expect(result?.getOwnerId()).toBe(OWNER_ID);
      expect(result?.getUploadedAt()).toEqual(uploadDate);
    });

    it('should return null when the bucket holds no matching file', async () => {
      bucket.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      await expect(repository.findById(FILE_ID)).resolves.toBeNull();
    });

    it('should fall back to octet-stream and a generated owner id when metadata is missing', async () => {
      bucket.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(FILE_ID),
            filename: 'sans-metadata.pdf',
            length: 10,
            uploadDate: new Date('2026-03-01T10:00:00.000Z'),
          },
        ]),
      });

      const result = await repository.findById(FILE_ID);

      expect(result?.getMimeType()).toBe('application/octet-stream');
      expect(result?.getOwnerId()).toMatch(/^[0-9a-f]{24}$/);
    });

    it('should propagate a bucket failure', async () => {
      bucket.find.mockReturnValue({
        toArray: jest.fn().mockRejectedValue(new Error('mongo down')),
      });

      await expect(repository.findById(FILE_ID)).rejects.toThrow('mongo down');
    });
  });

  describe('openDownloadStream()', () => {
    it('should open the download stream on the file object id', () => {
      const stream = Readable.from(['content']);
      bucket.openDownloadStream.mockReturnValue(stream);

      const result = repository.openDownloadStream(FILE_ID);

      const arg = bucket.openDownloadStream.mock
        .calls[0][0] as mongoose.Types.ObjectId;
      expect(arg.toString()).toBe(FILE_ID);
      expect(result).toBe(stream);
    });

    it('should throw when the id is not a valid ObjectId', () => {
      expect(() => repository.openDownloadStream('not-an-id')).toThrow();
    });
  });
});
