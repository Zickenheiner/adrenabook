import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProfessionalCenterRepository } from './professional-center.repository';
import { ProfessionalCenterMapper } from '../mappers/professional-center.mapper';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';
import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';

// Fabrique un maillon de chaine Mongoose terminee par exec()
const chain = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

const OWNER_ID = '68b4d59919d9b7a94b4fde21';

describe('ProfessionalCenterRepository', () => {
  let repository: ProfessionalCenterRepository;
  let centerModel: jest.Mock & Record<string, jest.Mock>;
  let mapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn().mockResolvedValue({ _id: 'center-1' });
    centerModel = jest.fn().mockImplementation((payload: unknown) => ({
      ...(payload as Record<string, unknown>),
      save: saveMock,
    })) as unknown as jest.Mock & Record<string, jest.Mock>;

    centerModel.find = jest.fn();
    centerModel.findById = jest.fn();
    centerModel.findOne = jest.fn();
    centerModel.findByIdAndUpdate = jest.fn();
    centerModel.findByIdAndDelete = jest.fn();

    mapper = {
      toEntity: jest.fn(
        (doc: { _id: string }) =>
          new ProfessionalCenterEntity(doc._id as never),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionalCenterRepository,
        { provide: getModelToken('ProfessionalCenter'), useValue: centerModel },
        { provide: ProfessionalCenterMapper, useValue: mapper },
      ],
    }).compile();

    repository = module.get<ProfessionalCenterRepository>(
      ProfessionalCenterRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    it('should map every center document', async () => {
      centerModel.find.mockReturnValue(chain([{ _id: 'a' }, { _id: 'b' }]));

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(mapper.toEntity).toHaveBeenCalledTimes(2);
    });

    it('should return null when the model resolves to null', async () => {
      centerModel.find.mockReturnValue(chain(null));

      await expect(repository.findAll()).resolves.toBeNull();
    });
  });

  describe('findById()', () => {
    it('should map the found center', async () => {
      centerModel.findById.mockReturnValue(chain({ _id: 'center-1' }));

      const result = await repository.findById('center-1');

      expect(centerModel.findById).toHaveBeenCalledWith('center-1');
      expect(result?.getId()).toBe('center-1');
    });

    it('should return null when the center does not exist', async () => {
      centerModel.findById.mockReturnValue(chain(null));

      await expect(repository.findById('unknown')).resolves.toBeNull();
    });
  });

  describe('findByOwnerId()', () => {
    it('should return null without querying when the owner id is invalid', async () => {
      const result = await repository.findByOwnerId('not-an-id');

      expect(result).toBeNull();
      expect(centerModel.findOne).not.toHaveBeenCalled();
    });

    it('should query on the owner object id and map the result', async () => {
      centerModel.findOne.mockReturnValue(chain({ _id: 'center-1' }));

      const result = await repository.findByOwnerId(OWNER_ID);

      const filter = centerModel.findOne.mock.calls[0][0] as {
        ownerId: Types.ObjectId;
      };
      expect(filter.ownerId.toString()).toBe(OWNER_ID);
      expect(result?.getId()).toBe('center-1');
    });

    it('should return null when the owner has no center', async () => {
      centerModel.findOne.mockReturnValue(chain(null));

      await expect(repository.findByOwnerId(OWNER_ID)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const dto = {
      companyName: 'Alpes Aventures',
      siret: '12345678901234',
    } as CreateProfessionalCenterDto;

    it('should attach the owner object id and return true on success', async () => {
      const result = await repository.create(dto, OWNER_ID);

      const payload = centerModel.mock.calls[0][0] as {
        companyName: string;
        ownerId: Types.ObjectId;
      };
      expect(payload.companyName).toBe('Alpes Aventures');
      expect(payload.ownerId.toString()).toBe(OWNER_ID);
      expect(result).toBe(true);
    });

    it('should return false when save resolves to a falsy value', async () => {
      saveMock.mockResolvedValue(null);

      await expect(repository.create(dto, OWNER_ID)).resolves.toBe(false);
    });

    it('should translate a duplicate key error into a ConflictException', async () => {
      saveMock.mockRejectedValue({ code: 11000 });

      await expect(repository.create(dto, OWNER_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should rethrow any other error untouched', async () => {
      saveMock.mockRejectedValue(new Error('network partition'));

      await expect(repository.create(dto, OWNER_ID)).rejects.toThrow(
        'network partition',
      );
    });
  });

  describe('update()', () => {
    it('should return true when a center was updated', async () => {
      centerModel.findByIdAndUpdate.mockReturnValue(chain({ _id: 'center-1' }));
      const dto = { companyName: 'Nouveau nom' } as UpdateProfessionalCenterDto;

      const result = await repository.update('center-1', dto);

      expect(centerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'center-1',
        dto,
        { new: true },
      );
      expect(result).toBe(true);
    });

    it('should return false when nothing matched', async () => {
      centerModel.findByIdAndUpdate.mockReturnValue(chain(null));

      await expect(
        repository.update('unknown', {} as UpdateProfessionalCenterDto),
      ).resolves.toBe(false);
    });
  });

  describe('delete()', () => {
    it('should return true when a center was deleted', async () => {
      centerModel.findByIdAndDelete.mockReturnValue(chain({ _id: 'center-1' }));

      await expect(repository.delete('center-1')).resolves.toBe(true);
      expect(centerModel.findByIdAndDelete).toHaveBeenCalledWith('center-1');
    });

    it('should return false when nothing matched', async () => {
      centerModel.findByIdAndDelete.mockReturnValue(chain(null));

      await expect(repository.delete('unknown')).resolves.toBe(false);
    });
  });
});
