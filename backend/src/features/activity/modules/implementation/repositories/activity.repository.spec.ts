import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PipelineStage, Types } from 'mongoose';
import { ActivityRepository } from './activity.repository';
import { ActivityMapper } from '../mappers/activity.mapper';
import { Activity } from '@features/activity/domains/schemas/activity.schema';
import {
  CreateActivityDto,
  SearchActivitiesQueryDto,
} from '@features/activity/domains/dtos/activity.dto';

/**
 * Simule un Aggregate Mongoose : il est directement awaitable (utilise par
 * findDetailById) et expose aussi exec() (utilise par search).
 */
const mockAggregate = <T>(result: T[]) =>
  Object.assign(Promise.resolve(result), {
    exec: jest.fn().mockResolvedValue(result),
  });

// Simule une Query Mongoose terminee par exec()
const mockQuery = <T>(result: T) => ({
  exec: jest.fn().mockResolvedValue(result),
});

interface ActivityModelMock extends jest.Mock {
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  aggregate: jest.Mock;
}

describe('ActivityRepository', () => {
  let repository: ActivityRepository;
  let activityModel: ActivityModelMock;
  let activityMapper: { toEntity: jest.Mock };
  let saveMock: jest.Mock;

  const activityId = new Types.ObjectId();
  const centerId = new Types.ObjectId();

  beforeEach(async () => {
    saveMock = jest.fn();

    activityModel = jest.fn().mockImplementation((data: unknown) => ({
      ...(data as Record<string, unknown>),
      save: saveMock,
    })) as unknown as ActivityModelMock;

    activityModel.find = jest.fn();
    activityModel.findById = jest.fn();
    activityModel.findByIdAndUpdate = jest.fn();
    activityModel.findByIdAndDelete = jest.fn();
    activityModel.aggregate = jest.fn();

    activityMapper = {
      toEntity: jest.fn((doc: { _id: unknown }) => ({
        entityFor: String(doc._id),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityRepository,
        { provide: getModelToken(Activity.name), useValue: activityModel },
        { provide: ActivityMapper, useValue: activityMapper },
      ],
    }).compile();

    repository = module.get<ActivityRepository>(ActivityRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    it('should map every document to an entity', async () => {
      activityModel.find.mockReturnValue(
        mockQuery([{ _id: 'a1' }, { _id: 'a2' }]),
      );

      const result = await repository.findAll();

      expect(activityModel.find).toHaveBeenCalledWith();
      expect(activityMapper.toEntity).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ entityFor: 'a1' }, { entityFor: 'a2' }]);
    });

    it('should return an empty array when no activity exists', async () => {
      activityModel.find.mockReturnValue(mockQuery([]));

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(activityMapper.toEntity).not.toHaveBeenCalled();
    });

    it('should return null when the query resolves to null', async () => {
      activityModel.find.mockReturnValue(mockQuery(null));

      const result = await repository.findAll();

      expect(result).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should map the found document', async () => {
      activityModel.findById.mockReturnValue(mockQuery({ _id: 'a1' }));

      const result = await repository.findById('a1');

      expect(activityModel.findById).toHaveBeenCalledWith('a1');
      expect(result).toEqual({ entityFor: 'a1' });
    });

    it('should return null when the document does not exist', async () => {
      activityModel.findById.mockReturnValue(mockQuery(null));

      const result = await repository.findById('missing');

      expect(result).toBeNull();
      expect(activityMapper.toEntity).not.toHaveBeenCalled();
    });
  });

  describe('findByCenterId()', () => {
    it('should filter on the centerId and map the documents', async () => {
      activityModel.find.mockReturnValue(mockQuery([{ _id: 'a1' }]));

      const result = await repository.findByCenterId('center-1');

      expect(activityModel.find).toHaveBeenCalledWith({
        centerId: 'center-1',
      });
      expect(result).toEqual([{ entityFor: 'a1' }]);
    });

    it('should return null when the query resolves to null', async () => {
      activityModel.find.mockReturnValue(mockQuery(null));

      const result = await repository.findByCenterId('center-1');

      expect(result).toBeNull();
    });
  });

  describe('create()', () => {
    const dto = {
      title: 'Saut a l elastique',
      description: 'Un saut de 60 metres',
      type: 'bungee',
      difficulty: 'beginner',
      durationMinutes: 45,
      priceFromEur: 120,
      prerequisites: { minAge: 18, medicalCertificateRequired: false },
      includedEquipment: ['harnais'],
      photoFileIds: ['file_1'],
      status: 'published',
    } as unknown as CreateActivityDto;

    it('should build the document with the centerId and map the result', async () => {
      saveMock.mockResolvedValue({ _id: 'created' });

      const result = await repository.create(dto, centerId.toString());

      expect(activityModel).toHaveBeenCalledWith({
        ...dto,
        centerId: centerId.toString(),
      });
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({ entityFor: 'created' });
    });

    it('should return null when the save returns nothing', async () => {
      saveMock.mockResolvedValue(null);

      const result = await repository.create(dto, centerId.toString());

      expect(result).toBeNull();
    });
  });

  describe('update()', () => {
    it('should return true when the document was updated', async () => {
      activityModel.findByIdAndUpdate.mockReturnValue(mockQuery({ _id: 'a1' }));

      const result = await repository.update('a1', { title: 'Nouveau titre' });

      expect(activityModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'a1',
        { title: 'Nouveau titre' },
        { new: true },
      );
      expect(result).toBe(true);
    });

    it('should return false when no document matched', async () => {
      activityModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));

      const result = await repository.update('missing', {});

      expect(result).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should return true when the document was deleted', async () => {
      activityModel.findByIdAndDelete.mockReturnValue(mockQuery({ _id: 'a1' }));

      const result = await repository.delete('a1');

      expect(activityModel.findByIdAndDelete).toHaveBeenCalledWith('a1');
      expect(result).toBe(true);
    });

    it('should return false when no document matched', async () => {
      activityModel.findByIdAndDelete.mockReturnValue(mockQuery(null));

      const result = await repository.delete('missing');

      expect(result).toBe(false);
    });
  });

  describe('findDetailById()', () => {
    const buildAggregationResult = (
      overrides: Record<string, unknown> = {},
    ) => ({
      _id: activityId,
      title: 'Canyoning Verdon',
      description: 'Descente encadree',
      type: 'canyoning',
      difficulty: 'intermediate',
      durationMinutes: 180,
      priceFromEur: 95,
      prerequisites: { minAge: 16, medicalCertificateRequired: true },
      includedEquipment: ['combinaison', 'casque'],
      photoFileIds: ['file_1', 'file_2'],
      status: 'published',
      center: {
        _id: centerId,
        companyName: 'Adrena Verdon',
        address: {
          street: '1 rue du Pont',
          city: 'Castellane',
          postalCode: '04120',
          country: 'France',
        },
      },
      upcomingSlots: [
        {
          _id: new Types.ObjectId(),
          startAt: new Date('2026-09-01T08:00:00.000Z'),
          maxParticipants: 8,
          priceEur: 95,
        },
      ],
      ...overrides,
    });

    it('should return null for an invalid ObjectId without querying', async () => {
      const result = await repository.findDetailById('not-an-object-id');

      expect(result).toBeNull();
      expect(activityModel.aggregate).not.toHaveBeenCalled();
    });

    it('should return null when the aggregation returns no document', async () => {
      activityModel.aggregate.mockReturnValue(mockAggregate([]));

      const result = await repository.findDetailById(activityId.toString());

      expect(result).toBeNull();
    });

    it('should only match published activities in the pipeline', async () => {
      activityModel.aggregate.mockReturnValue(mockAggregate([]));

      await repository.findDetailById(activityId.toString());

      const pipeline = activityModel.aggregate.mock
        .calls[0][0] as PipelineStage[];
      expect(pipeline[0]).toEqual({
        $match: { _id: expect.any(Types.ObjectId), status: 'published' },
      });
    });

    it('should build the full detail DTO', async () => {
      const doc = buildAggregationResult();
      activityModel.aggregate.mockReturnValue(mockAggregate([doc]));

      const result = await repository.findDetailById(activityId.toString());

      expect(result).not.toBeNull();
      expect(result!.id).toBe(activityId.toString());
      expect(result!.title).toBe('Canyoning Verdon');
      expect(result!.description).toBe('Descente encadree');
      expect(result!.type).toBe('canyoning');
      expect(result!.difficulty).toBe('intermediate');
      expect(result!.durationMinutes).toBe(180);
      expect(result!.priceFromEur).toBe(95);
      expect(result!.prerequisites).toEqual(doc.prerequisites);
      expect(result!.includedEquipment).toEqual(['combinaison', 'casque']);
      expect(result!.videos).toEqual([]);
      expect(result!.reviewsSummary).toEqual({ count: 0, averageRating: 0 });
    });

    it('should build one photo entry per file id with an indexed alt text', async () => {
      activityModel.aggregate.mockReturnValue(
        mockAggregate([buildAggregationResult()]),
      );

      const result = await repository.findDetailById(activityId.toString());

      expect(result!.photos).toEqual([
        { url: 'file_1', alt: 'Canyoning Verdon - photo 1' },
        { url: 'file_2', alt: 'Canyoning Verdon - photo 2' },
      ]);
    });

    it('should flatten the center address', async () => {
      activityModel.aggregate.mockReturnValue(
        mockAggregate([buildAggregationResult()]),
      );

      const result = await repository.findDetailById(activityId.toString());

      expect(result!.center).toEqual({
        id: centerId.toString(),
        name: 'Adrena Verdon',
        location: {
          lat: 0,
          lng: 0,
          address: '1 rue du Pont, 04120 Castellane, France',
        },
      });
    });

    it('should return an empty address string when the center has none', async () => {
      activityModel.aggregate.mockReturnValue(
        mockAggregate([
          buildAggregationResult({
            center: { _id: centerId, companyName: 'Adrena Verdon' },
          }),
        ]),
      );

      const result = await repository.findDetailById(activityId.toString());

      expect(result!.center.location.address).toBe('');
    });

    it('should return a blank center when the lookup found none', async () => {
      activityModel.aggregate.mockReturnValue(
        mockAggregate([buildAggregationResult({ center: undefined })]),
      );

      const result = await repository.findDetailById(activityId.toString());

      expect(result!.center).toEqual({
        id: '',
        name: '',
        location: { lat: 0, lng: 0, address: '' },
      });
    });

    it('should map the upcoming slots and expose maxParticipants as remainingSeats', async () => {
      const doc = buildAggregationResult();
      activityModel.aggregate.mockReturnValue(mockAggregate([doc]));

      const result = await repository.findDetailById(activityId.toString());

      expect(result!.upcomingSlots).toEqual([
        {
          id: doc.upcomingSlots[0]._id.toString(),
          startAt: '2026-09-01T08:00:00.000Z',
          remainingSeats: 8,
          priceEur: 95,
        },
      ]);
    });

    it('should stringify a slot startAt that is not a Date', async () => {
      const slotId = new Types.ObjectId();
      activityModel.aggregate.mockReturnValue(
        mockAggregate([
          buildAggregationResult({
            upcomingSlots: [
              {
                _id: slotId,
                startAt: '2026-09-02T08:00:00.000Z',
                maxParticipants: 4,
                priceEur: 80,
              },
            ],
          }),
        ]),
      );

      const result = await repository.findDetailById(activityId.toString());

      expect(result!.upcomingSlots[0].startAt).toBe('2026-09-02T08:00:00.000Z');
    });

    it('should default the optional arrays when they are missing', async () => {
      activityModel.aggregate.mockReturnValue(
        mockAggregate([
          buildAggregationResult({
            includedEquipment: undefined,
            photoFileIds: undefined,
            upcomingSlots: undefined,
          }),
        ]),
      );

      const result = await repository.findDetailById(activityId.toString());

      expect(result!.includedEquipment).toEqual([]);
      expect(result!.photos).toEqual([]);
      expect(result!.upcomingSlots).toEqual([]);
    });
  });

  describe('search()', () => {
    const stubAggregations = (
      countResult: unknown[],
      dataResult: unknown[],
    ) => {
      activityModel.aggregate
        .mockReturnValueOnce(mockAggregate(countResult))
        .mockReturnValueOnce(mockAggregate(dataResult));
    };

    const lastPipelines = () => ({
      count: activityModel.aggregate.mock.calls[0][0] as PipelineStage[],
      data: activityModel.aggregate.mock.calls[1][0] as PipelineStage[],
    });

    it('should use the default pagination when none is provided', async () => {
      stubAggregations([], []);

      const result = await repository.search({} as SearchActivitiesQueryDto);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.total).toBe(0);
      expect(result.items).toEqual([]);

      const { data } = lastPipelines();
      expect(data).toContainEqual({ $skip: 0 });
      expect(data).toContainEqual({ $limit: 20 });
    });

    it('should cap the page size at 50', async () => {
      stubAggregations([], []);

      const result = await repository.search({
        pageSize: 200,
      } as SearchActivitiesQueryDto);

      expect(result.pageSize).toBe(50);
      expect(lastPipelines().data).toContainEqual({ $limit: 50 });
    });

    it('should compute the skip from the page number', async () => {
      stubAggregations([], []);

      await repository.search({
        page: 3,
        pageSize: 10,
      } as SearchActivitiesQueryDto);

      expect(lastPipelines().data).toContainEqual({ $skip: 20 });
    });

    it('should only match published activities by default', async () => {
      stubAggregations([], []);

      await repository.search({} as SearchActivitiesQueryDto);

      expect(lastPipelines().count[0]).toEqual({
        $match: { status: 'published' },
      });
    });

    it('should apply the type and difficulty filters', async () => {
      stubAggregations([], []);

      await repository.search({
        type: 'climbing',
        difficulty: 'advanced',
      } as SearchActivitiesQueryDto);

      expect(lastPipelines().count[0]).toEqual({
        $match: {
          status: 'published',
          type: 'climbing',
          difficulty: 'advanced',
        },
      });
    });

    it('should apply a lower bound only price filter', async () => {
      stubAggregations([], []);

      await repository.search({
        priceMin: 50,
      } as SearchActivitiesQueryDto);

      expect(lastPipelines().count[0]).toEqual({
        $match: { status: 'published', priceFromEur: { $gte: 50 } },
      });
    });

    it('should apply an upper bound only price filter', async () => {
      stubAggregations([], []);

      await repository.search({
        priceMax: 300,
      } as SearchActivitiesQueryDto);

      expect(lastPipelines().count[0]).toEqual({
        $match: { status: 'published', priceFromEur: { $lte: 300 } },
      });
    });

    it('should apply a bounded price filter', async () => {
      stubAggregations([], []);

      await repository.search({
        priceMin: 50,
        priceMax: 300,
      } as SearchActivitiesQueryDto);

      expect(lastPipelines().count[0]).toEqual({
        $match: {
          status: 'published',
          priceFromEur: { $gte: 50, $lte: 300 },
        },
      });
    });

    it('should apply a full text filter for a free text query', async () => {
      stubAggregations([], []);

      await repository.search({
        query: 'parachute',
      } as SearchActivitiesQueryDto);

      expect(lastPipelines().count[0]).toEqual({
        $match: {
          status: 'published',
          $text: { $search: 'parachute' },
        },
      });
    });

    it('should sort by descending _id by default', async () => {
      stubAggregations([], []);

      await repository.search({} as SearchActivitiesQueryDto);

      expect(lastPipelines().count).toContainEqual({ $sort: { _id: -1 } });
    });

    it('should sort by ascending price for sortBy=price_asc', async () => {
      stubAggregations([], []);

      await repository.search({
        sortBy: 'price_asc',
      } as SearchActivitiesQueryDto);

      expect(lastPipelines().count).toContainEqual({
        $sort: { priceFromEur: 1 },
      });
    });

    it('should sort by descending price for sortBy=price_desc', async () => {
      stubAggregations([], []);

      await repository.search({
        sortBy: 'price_desc',
      } as SearchActivitiesQueryDto);

      expect(lastPipelines().count).toContainEqual({
        $sort: { priceFromEur: -1 },
      });
    });

    it('should append a count stage to the count pipeline', async () => {
      stubAggregations([{ total: 7 }], []);

      const result = await repository.search({} as SearchActivitiesQueryDto);

      const { count } = lastPipelines();
      expect(count[count.length - 1]).toEqual({ $count: 'total' });
      expect(result.total).toBe(7);
    });

    it('should map the returned documents to search items', async () => {
      const docId = new Types.ObjectId();
      stubAggregations(
        [{ total: 1 }],
        [
          {
            _id: docId,
            title: 'Plongee Marseille',
            type: 'diving',
            priceFromEur: 70,
            durationMinutes: 90,
            difficulty: 'beginner',
            centerName: 'Adrena Sud',
            coverPhotoUrl: 'file_cover',
          },
        ],
      );

      const result = await repository.search({} as SearchActivitiesQueryDto);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: docId.toString(),
        title: 'Plongee Marseille',
        type: 'diving',
        priceFromEur: 70,
        durationMinutes: 90,
        difficulty: 'beginner',
        centerName: 'Adrena Sud',
        coverPhotoUrl: 'file_cover',
      });
    });

    it('should default centerName and coverPhotoUrl to empty strings', async () => {
      stubAggregations(
        [{ total: 1 }],
        [
          {
            _id: 'a1',
            title: 'Sans centre',
            type: 'bungee',
            priceFromEur: 120,
            durationMinutes: 30,
            difficulty: 'beginner',
          },
        ],
      );

      const result = await repository.search({} as SearchActivitiesQueryDto);

      expect(result.items[0].centerName).toBe('');
      expect(result.items[0].coverPhotoUrl).toBe('');
    });
  });
});
