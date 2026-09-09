import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CenterReviewRepository } from './center-review.repository';
import { CenterReviewMapper } from '../mappers/center-review.mapper';
import { CenterReviewEntity } from '@features/admin/domains/entities/center-review.entity';
import { ReviewCenterDto } from '@features/admin/domains/dtos/center-review.dto';

// Fabrique un maillon de chaine Mongoose terminee par exec()
const chain = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('CenterReviewRepository', () => {
  let repository: CenterReviewRepository;
  let reviewModel: jest.Mock & Record<string, jest.Mock>;
  let professionalCenterModel: Record<string, jest.Mock>;
  let mapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;
  let sortChain: { sort: jest.Mock; exec: jest.Mock };

  const professionalCenterDoc = () => ({
    _id: { toString: () => 'center-1' },
    companyName: 'Alpes Aventures',
    contactEmail: 'contact@alpes.fr',
    contactPhone: '0400000000',
    siret: '12345678901234',
    address: { city: 'Grenoble' },
    status: 'pending_review',
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    documents: {
      kbisFileId: 'kbis-1',
      rcProFileId: 'rc-1',
      instructorDiplomas: ['dip-1', 'dip-2'],
    },
  });

  beforeEach(async () => {
    saveMock = jest.fn().mockResolvedValue({ _id: 'review-1' });
    reviewModel = jest.fn().mockImplementation((dto: unknown) => ({
      ...(dto as Record<string, unknown>),
      save: saveMock,
    })) as unknown as jest.Mock & Record<string, jest.Mock>;

    reviewModel.find = jest.fn();
    reviewModel.findById = jest.fn();
    reviewModel.findByIdAndDelete = jest.fn();

    sortChain = {
      sort: jest.fn(),
      exec: jest.fn().mockResolvedValue([professionalCenterDoc()]),
    };
    sortChain.sort.mockReturnValue(sortChain);

    professionalCenterModel = {
      find: jest.fn().mockReturnValue(sortChain),
      findById: jest.fn(),
    };

    mapper = {
      toEntity: jest.fn(
        (doc: { _id: string }) => new CenterReviewEntity(doc._id as never),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CenterReviewRepository,
        { provide: getModelToken('CenterReview'), useValue: reviewModel },
        {
          provide: getModelToken('ProfessionalCenter'),
          useValue: professionalCenterModel,
        },
        { provide: CenterReviewMapper, useValue: mapper },
      ],
    }).compile();

    repository = module.get<CenterReviewRepository>(CenterReviewRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    it('should map every review document', async () => {
      reviewModel.find.mockReturnValue(chain([{ _id: 'a' }, { _id: 'b' }]));

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(mapper.toEntity).toHaveBeenCalledTimes(2);
    });

    it('should return null when the model resolves to null', async () => {
      reviewModel.find.mockReturnValue(chain(null));

      await expect(repository.findAll()).resolves.toBeNull();
    });
  });

  describe('findById()', () => {
    it('should map the found review', async () => {
      reviewModel.findById.mockReturnValue(chain({ _id: 'review-1' }));

      const result = await repository.findById('review-1');

      expect(reviewModel.findById).toHaveBeenCalledWith('review-1');
      expect(result?.getId()).toBe('review-1');
    });

    it('should return null when nothing matches', async () => {
      reviewModel.findById.mockReturnValue(chain(null));

      await expect(repository.findById('unknown')).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    it('should save the dto and map the created review', async () => {
      const dto = { decision: 'approve' } as ReviewCenterDto;

      const result = await repository.create(dto);

      expect(reviewModel).toHaveBeenCalledWith(dto);
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result.getId()).toBe('review-1');
    });

    it('should propagate a save failure', async () => {
      saveMock.mockRejectedValue(new Error('validation failed'));

      await expect(
        repository.create({ decision: 'reject' } as ReviewCenterDto),
      ).rejects.toThrow('validation failed');
    });
  });

  describe('delete()', () => {
    it('should return true when a review was deleted', async () => {
      reviewModel.findByIdAndDelete.mockReturnValue(chain({ _id: 'review-1' }));

      await expect(repository.delete('review-1')).resolves.toBe(true);
      expect(reviewModel.findByIdAndDelete).toHaveBeenCalledWith('review-1');
    });

    it('should return false when nothing was deleted', async () => {
      reviewModel.findByIdAndDelete.mockReturnValue(chain(null));

      await expect(repository.delete('unknown')).resolves.toBe(false);
    });
  });

  describe('findCenters()', () => {
    it('should query without filter when no status is given', async () => {
      await repository.findCenters();

      expect(professionalCenterModel.find).toHaveBeenCalledWith({});
      expect(sortChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should filter on the requested status', async () => {
      await repository.findCenters('approved');

      expect(professionalCenterModel.find).toHaveBeenCalledWith({
        status: 'approved',
      });
    });

    it('should project the KYC documents into PendingCenterDto', async () => {
      const result = await repository.findCenters();

      expect(result).toEqual([
        {
          id: 'center-1',
          name: 'Alpes Aventures',
          email: 'contact@alpes.fr',
          phone: '0400000000',
          siret: '12345678901234',
          city: 'Grenoble',
          status: 'pending_review',
          submittedAt: '2026-03-01T10:00:00.000Z',
          kbisFileId: 'kbis-1',
          rcProFileId: 'rc-1',
          instructorDiplomaFileIds: ['dip-1', 'dip-2'],
        },
      ]);
    });

    it('should fall back to empty values when the address, dates and documents are missing', async () => {
      sortChain.exec.mockResolvedValue([
        {
          _id: { toString: () => 'center-2' },
          companyName: 'Sans Papiers',
          contactEmail: 'a@b.fr',
          contactPhone: '0',
          siret: '000',
          status: 'pending_review',
        },
      ]);

      const result = await repository.findCenters();

      expect(result[0].city).toBe('');
      expect(result[0].submittedAt).toBe('');
      expect(result[0].kbisFileId).toBeUndefined();
      expect(result[0].instructorDiplomaFileIds).toEqual([]);
    });

    it('should return an empty list when no center matches', async () => {
      sortChain.exec.mockResolvedValue([]);

      await expect(repository.findCenters()).resolves.toEqual([]);
    });
  });

  describe('findCenterById()', () => {
    it('should project the found center', async () => {
      professionalCenterModel.findById.mockReturnValue(
        chain(professionalCenterDoc()),
      );

      const result = await repository.findCenterById('center-1');

      expect(professionalCenterModel.findById).toHaveBeenCalledWith('center-1');
      expect(result?.id).toBe('center-1');
      expect(result?.name).toBe('Alpes Aventures');
    });

    it('should return null when the center does not exist', async () => {
      professionalCenterModel.findById.mockReturnValue(chain(null));

      await expect(repository.findCenterById('unknown')).resolves.toBeNull();
    });
  });
});
