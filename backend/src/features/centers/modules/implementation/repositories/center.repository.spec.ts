import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CenterRepository } from './center.repository';
import { CenterMapper } from '../mappers/center.mapper';
import { CenterEntity } from '@features/centers/domains/entities/center.entity';
import {
  CentersMapQueryDto,
  CentersQueryDto,
  CreateCenterDto,
  UpdateCenterDto,
} from '@features/centers/domains/dtos/center.dto';

// Fabrique un maillon de chaine Mongoose terminee par exec()
const chain = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('CenterRepository', () => {
  let repository: CenterRepository;
  let centerModel: jest.Mock & Record<string, jest.Mock>;
  let mapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const buildEntity = (id: string): CenterEntity =>
    new CenterEntity(id as never);

  const buildModule = async (): Promise<TestingModule> => {
    saveMock = jest.fn();
    centerModel = jest.fn().mockImplementation((dto: unknown) => ({
      ...(dto as Record<string, unknown>),
      save: saveMock,
    })) as unknown as jest.Mock & Record<string, jest.Mock>;

    centerModel.find = jest.fn();
    centerModel.findById = jest.fn();
    centerModel.findByIdAndUpdate = jest.fn();
    centerModel.findByIdAndDelete = jest.fn();

    mapper = {
      toEntity: jest.fn((doc: { _id: string }) => buildEntity(doc._id)),
    };

    return Test.createTestingModule({
      providers: [
        CenterRepository,
        { provide: getModelToken('Center'), useValue: centerModel },
        { provide: CenterMapper, useValue: mapper },
      ],
    }).compile();
  };

  beforeEach(async () => {
    const module = await buildModule();
    repository = module.get<CenterRepository>(CenterRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    it('should map every document returned by the model', async () => {
      centerModel.find.mockReturnValue(chain([{ _id: 'a' }, { _id: 'b' }]));

      const result = await repository.findAll();

      expect(centerModel.find).toHaveBeenCalledTimes(1);
      expect(mapper.toEntity).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no center exists', async () => {
      centerModel.find.mockReturnValue(chain([]));

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should return null when the model resolves to null', async () => {
      centerModel.find.mockReturnValue(chain(null));

      const result = await repository.findAll();

      expect(result).toBeNull();
    });

    it('should propagate a model failure', async () => {
      centerModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('mongo down')),
      });

      await expect(repository.findAll()).rejects.toThrow('mongo down');
    });
  });

  describe('findById()', () => {
    it('should map the found document', async () => {
      centerModel.findById.mockReturnValue(chain({ _id: 'center-1' }));

      const result = await repository.findById('center-1');

      expect(centerModel.findById).toHaveBeenCalledWith('center-1');
      expect(result?.getId()).toBe('center-1');
    });

    it('should return null when no document matches', async () => {
      centerModel.findById.mockReturnValue(chain(null));

      const result = await repository.findById('unknown');

      expect(result).toBeNull();
      expect(mapper.toEntity).not.toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('should instantiate the model, save it and map the result', async () => {
      saveMock.mockResolvedValue({ _id: 'new-center' });
      const dto = {
        name: 'Alpes Aventures',
        lat: 45.1,
        lng: 5.7,
      } as CreateCenterDto;

      const result = await repository.create(dto);

      expect(centerModel).toHaveBeenCalledWith(dto);
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result?.getId()).toBe('new-center');
    });

    it('should return null when save resolves to a falsy value', async () => {
      saveMock.mockResolvedValue(null);

      const result = await repository.create({} as CreateCenterDto);

      expect(result).toBeNull();
    });

    it('should propagate a save failure', async () => {
      saveMock.mockRejectedValue(new Error('validation failed'));

      await expect(repository.create({} as CreateCenterDto)).rejects.toThrow(
        'validation failed',
      );
    });
  });

  describe('update()', () => {
    it('should return true when a document was updated', async () => {
      centerModel.findByIdAndUpdate.mockReturnValue(chain({ _id: 'center-1' }));
      const dto = { name: 'Nouveau nom' } as UpdateCenterDto;

      const result = await repository.update('center-1', dto);

      expect(centerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'center-1',
        dto,
        { new: true },
      );
      expect(result).toBe(true);
    });

    it('should return false when no document matched', async () => {
      centerModel.findByIdAndUpdate.mockReturnValue(chain(null));

      const result = await repository.update('unknown', {} as UpdateCenterDto);

      expect(result).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should return true when a document was deleted', async () => {
      centerModel.findByIdAndDelete.mockReturnValue(chain({ _id: 'center-1' }));

      const result = await repository.delete('center-1');

      expect(centerModel.findByIdAndDelete).toHaveBeenCalledWith('center-1');
      expect(result).toBe(true);
    });

    it('should return false when no document matched', async () => {
      centerModel.findByIdAndDelete.mockReturnValue(chain(null));

      const result = await repository.delete('unknown');

      expect(result).toBe(false);
    });
  });

  describe('findByBbox()', () => {
    it('should build a lat/lng range filter from the bbox string', async () => {
      centerModel.find.mockReturnValue(chain([{ _id: 'a' }]));
      const query = {
        bbox: '5.0,45.0,6.0,46.0',
        zoom: 10,
      } as CentersMapQueryDto;

      const result = await repository.findByBbox(query);

      expect(centerModel.find).toHaveBeenCalledWith({
        lat: { $gte: 45, $lte: 46 },
        lng: { $gte: 5, $lte: 6 },
      });
      expect(result).toHaveLength(1);
    });

    it('should add the activityTypes filter when activityType is provided', async () => {
      centerModel.find.mockReturnValue(chain([]));
      const query = {
        bbox: '5.0,45.0,6.0,46.0',
        zoom: 10,
        activityType: 'parapente',
      } as CentersMapQueryDto;

      await repository.findByBbox(query);

      expect(centerModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ activityTypes: 'parapente' }),
      );
    });

    it('should return null when the model resolves to null', async () => {
      centerModel.find.mockReturnValue(chain(null));

      const result = await repository.findByBbox({
        bbox: '5.0,45.0,6.0,46.0',
        zoom: 10,
      } as CentersMapQueryDto);

      expect(result).toBeNull();
    });
  });

  describe('findByRadius()', () => {
    it('should build an approximate bounding box from lat/lng/radius', async () => {
      centerModel.find.mockReturnValue(chain([{ _id: 'a' }]));
      const query = { lat: 45, lng: 5, radius: 111 } as CentersQueryDto;

      await repository.findByRadius(query);

      const filter = centerModel.find.mock.calls[0][0] as {
        lat: { $gte: number; $lte: number };
        lng: { $gte: number; $lte: number };
      };
      expect(filter.lat.$gte).toBeCloseTo(44, 5);
      expect(filter.lat.$lte).toBeCloseTo(46, 5);
      expect(filter.lng.$gte).toBeLessThan(5);
      expect(filter.lng.$lte).toBeGreaterThan(5);
    });

    it('should not build any geographic filter when the coordinates are incomplete', async () => {
      centerModel.find.mockReturnValue(chain([]));

      await repository.findByRadius({ lat: 45, lng: 5 } as CentersQueryDto);

      expect(centerModel.find).toHaveBeenCalledWith({});
    });

    it('should add the activityTypes filter when type is provided', async () => {
      centerModel.find.mockReturnValue(chain([]));

      await repository.findByRadius({ type: 'canyoning' } as CentersQueryDto);

      expect(centerModel.find).toHaveBeenCalledWith({
        activityTypes: 'canyoning',
      });
    });

    it('should return null when the model resolves to null', async () => {
      centerModel.find.mockReturnValue(chain(null));

      const result = await repository.findByRadius({} as CentersQueryDto);

      expect(result).toBeNull();
    });
  });
});
