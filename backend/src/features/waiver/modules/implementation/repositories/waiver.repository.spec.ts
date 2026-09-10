import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { WaiverRepository } from './waiver.repository';
import { WaiverMapper } from '../mappers/waiver.mapper';
import { WaiverEntity } from '@features/waiver/domains/entities/waiver.entity';
import { SignWaiverDto } from '@features/waiver/domains/dtos/waiver.dto';

// Fabrique un maillon de chaine Mongoose terminee par exec()
const chain = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

const BOOKING_ID = '68b4d59919d9b7a94b4fde21';
const USER_ID = '68b4d59919d9b7a94b4fde22';

describe('WaiverRepository', () => {
  let repository: WaiverRepository;
  let waiverModel: jest.Mock & Record<string, jest.Mock>;
  let bookingModel: Record<string, jest.Mock>;
  let mapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const canvasDto: SignWaiverDto = {
    signatureMethod: 'canvas',
    signaturePayload: 'data:image/png;base64,AAA',
    acknowledgedRisks: true,
  };

  beforeEach(async () => {
    saveMock = jest.fn().mockResolvedValue({ _id: 'waiver-1' });
    waiverModel = jest.fn().mockImplementation((payload: unknown) => ({
      ...(payload as Record<string, unknown>),
      save: saveMock,
    })) as unknown as jest.Mock & Record<string, jest.Mock>;
    waiverModel.findOne = jest.fn().mockReturnValue(chain(null));

    bookingModel = {
      findById: jest.fn().mockReturnValue(chain({ _id: BOOKING_ID })),
    };

    mapper = {
      toEntity: jest.fn(
        (doc: { _id: string }) => new WaiverEntity(doc._id as never),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaiverRepository,
        { provide: getModelToken('Waiver'), useValue: waiverModel },
        { provide: getModelToken('Booking'), useValue: bookingModel },
        { provide: WaiverMapper, useValue: mapper },
      ],
    }).compile();

    repository = module.get<WaiverRepository>(WaiverRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByBookingId()', () => {
    it('should map the waiver found for the booking', async () => {
      waiverModel.findOne.mockReturnValue(chain({ _id: 'waiver-1' }));

      const result = await repository.findByBookingId(BOOKING_ID);

      expect(waiverModel.findOne).toHaveBeenCalledWith({
        bookingId: BOOKING_ID,
      });
      expect(result?.getId()).toBe('waiver-1');
    });

    it('should return null when the booking has no waiver', async () => {
      waiverModel.findOne.mockReturnValue(chain(null));

      await expect(repository.findByBookingId(BOOKING_ID)).resolves.toBeNull();
    });
  });

  describe('sign()', () => {
    it('should throw NotFoundException when the booking does not exist', async () => {
      bookingModel.findById.mockReturnValue(chain(null));

      await expect(
        repository.sign(BOOKING_ID, USER_ID, canvasDto),
      ).rejects.toThrow(NotFoundException);
      expect(waiverModel).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when a waiver already exists', async () => {
      waiverModel.findOne.mockReturnValue(chain({ _id: 'waiver-1' }));

      await expect(
        repository.sign(BOOKING_ID, USER_ID, canvasDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when the risks are not acknowledged', async () => {
      await expect(
        repository.sign(BOOKING_ID, USER_ID, {
          ...canvasDto,
          acknowledgedRisks: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the OTP code is not 6 digits', async () => {
      await expect(
        repository.sign(BOOKING_ID, USER_ID, {
          signatureMethod: 'otp_sms',
          signaturePayload: '123',
          acknowledgedRisks: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the OTP code is not numeric', async () => {
      await expect(
        repository.sign(BOOKING_ID, USER_ID, {
          signatureMethod: 'otp_sms',
          signaturePayload: 'abcdef',
          acknowledgedRisks: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept a valid 6-digit OTP code', async () => {
      const result = await repository.sign(BOOKING_ID, USER_ID, {
        signatureMethod: 'otp_sms',
        signaturePayload: '123456',
        acknowledgedRisks: true,
      });

      expect(result.getId()).toBe('waiver-1');
    });

    it('should not apply the OTP format rule to a canvas signature', async () => {
      await expect(
        repository.sign(BOOKING_ID, USER_ID, canvasDto),
      ).resolves.toBeDefined();
    });

    it('should persist the waiver with object ids, a sha256 hash and a signature date', async () => {
      await repository.sign(BOOKING_ID, USER_ID, canvasDto);

      const payload = waiverModel.mock.calls[0][0] as {
        bookingId: mongoose.Types.ObjectId;
        userId: mongoose.Types.ObjectId;
        signatureMethod: string;
        signaturePayload: string;
        acknowledgedRisks: boolean;
        documentHash: string;
        signedAt: Date;
      };

      expect(payload.bookingId.toString()).toBe(BOOKING_ID);
      expect(payload.userId.toString()).toBe(USER_ID);
      expect(payload.signatureMethod).toBe('canvas');
      expect(payload.signaturePayload).toBe(canvasDto.signaturePayload);
      expect(payload.acknowledgedRisks).toBe(true);
      expect(payload.documentHash).toMatch(/^[0-9a-f]{64}$/);
      expect(payload.signedAt).toBeInstanceOf(Date);
      expect(saveMock).toHaveBeenCalledTimes(1);
    });

    it('should not store any downloadUrl', async () => {
      await repository.sign(BOOKING_ID, USER_ID, canvasDto);

      const payload = waiverModel.mock.calls[0][0] as Record<string, unknown>;
      expect(payload).not.toHaveProperty('downloadUrl');
    });

    it('should produce different hashes for two different signatures', async () => {
      await repository.sign(BOOKING_ID, USER_ID, canvasDto);
      await repository.sign(BOOKING_ID, USER_ID, {
        ...canvasDto,
        signaturePayload: 'data:image/png;base64,BBB',
      });

      const first = waiverModel.mock.calls[0][0] as { documentHash: string };
      const second = waiverModel.mock.calls[1][0] as { documentHash: string };
      expect(first.documentHash).not.toBe(second.documentHash);
    });

    it('should propagate a save failure', async () => {
      saveMock.mockRejectedValue(new Error('write failed'));

      await expect(
        repository.sign(BOOKING_ID, USER_ID, canvasDto),
      ).rejects.toThrow('write failed');
    });
  });
});
