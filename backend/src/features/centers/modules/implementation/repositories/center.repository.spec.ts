import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CenterRepository } from './center.repository';
import {
  CentersMapQueryDto,
  CentersQueryDto,
} from '@features/centers/domains/dtos/center.dto';

describe('CenterRepository', () => {
  let repository: CenterRepository;
  let professionalCenterModel: { aggregate: jest.Mock };

  const buildModule = async (): Promise<TestingModule> => {
    professionalCenterModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    };

    return Test.createTestingModule({
      providers: [
        CenterRepository,
        {
          provide: getModelToken('ProfessionalCenter'),
          useValue: professionalCenterModel,
        },
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

  // La carte lit la collection professionnelle : c'est la seule alimentee par
  // le parcours d'inscription.
  describe('findByBbox()', () => {
    const aggregateWith = (docs: unknown[]) => {
      professionalCenterModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(docs),
      });
    };

    const stagesOf = (): Record<string, never>[] =>
      professionalCenterModel.aggregate.mock.calls[0][0] as Record<
        string,
        never
      >[];

    it('should read the centers from the professional collection', async () => {
      aggregateWith([]);

      await repository.findByBbox({
        bbox: '5.0,45.0,6.0,46.0',
        zoom: 10,
      } as CentersMapQueryDto);

      expect(professionalCenterModel.aggregate).toHaveBeenCalled();
    });

    it('should only keep approved and geocoded centers inside the bbox', async () => {
      aggregateWith([]);

      await repository.findByBbox({
        bbox: '5.0,45.0,6.0,46.0',
        zoom: 10,
      } as CentersMapQueryDto);

      const match = stagesOf()[0]['$match'] as unknown as Record<
        string,
        Record<string, number | boolean>
      >;
      expect(match.status).toBe('approved');
      expect(match['location.lat']).toEqual({
        $exists: true,
        $gte: 45,
        $lte: 46,
      });
      expect(match['location.lng']).toEqual({ $gte: 5, $lte: 6 });
    });

    it('should map an aggregated center onto the entity', async () => {
      aggregateWith([
        {
          _id: 'center-1',
          name: 'Arkose',
          lat: 43.6753,
          lng: 1.4989,
          city: "L'Union",
          activityTypes: ['escalade'],
          activitiesCount: 2,
        },
      ]);

      const result = await repository.findByBbox({
        bbox: '0,0,10,50',
        zoom: 10,
      } as CentersMapQueryDto);

      expect(result).toHaveLength(1);
      expect(result![0].getName()).toBe('Arkose');
      expect(result![0].getLat()).toBe(43.6753);
      expect(result![0].getLng()).toBe(1.4989);
      expect(result![0].getCity()).toBe("L'Union");
      expect(result![0].getActivitiesCount()).toBe(2);
    });

    it('should filter on the aggregated activity types when activityType is provided', async () => {
      aggregateWith([]);

      await repository.findByBbox({
        bbox: '5.0,45.0,6.0,46.0',
        zoom: 10,
        activityType: 'parapente',
      } as CentersMapQueryDto);

      const stages = stagesOf();
      expect(stages[stages.length - 1]).toEqual({
        $match: { activityTypes: 'parapente' },
      });
    });
  });

  describe('findByRadius()', () => {
    const aggregateWith = (docs: unknown[]) => {
      professionalCenterModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(docs),
      });
    };

    const matchOf = () =>
      (
        professionalCenterModel.aggregate.mock.calls[0][0] as Record<
          string,
          never
        >[]
      )[0]['$match'] as unknown as Record<string, Record<string, number>>;

    it('should build an approximate bounding box from lat/lng/radius', async () => {
      aggregateWith([]);

      await repository.findByRadius({
        lat: 45,
        lng: 5,
        radius: 111,
      } as CentersQueryDto);

      const match = matchOf();
      expect(match['location.lat'].$gte).toBeCloseTo(44, 5);
      expect(match['location.lat'].$lte).toBeCloseTo(46, 5);
      expect(match['location.lng'].$gte).toBeLessThan(5);
      expect(match['location.lng'].$lte).toBeGreaterThan(5);
    });

    it('should return every approved center when no coordinate is given', async () => {
      aggregateWith([]);

      await repository.findByRadius({} as CentersQueryDto);

      // Sans filtre geographique, seules les conditions de base subsistent.
      expect(matchOf()).toEqual({
        status: 'approved',
        'location.lat': { $exists: true },
      });
    });

    it('should not build any geographic filter when the coordinates are incomplete', async () => {
      aggregateWith([]);

      await repository.findByRadius({ lat: 45, lng: 5 } as CentersQueryDto);

      expect(matchOf()['location.lat']).toEqual({ $exists: true });
    });

    it('should return an empty list when no center matches', async () => {
      aggregateWith([]);

      await expect(
        repository.findByRadius({} as CentersQueryDto),
      ).resolves.toEqual([]);
    });
  });
});
