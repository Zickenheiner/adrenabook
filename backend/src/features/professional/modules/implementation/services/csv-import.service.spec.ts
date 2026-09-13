import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Readable } from 'stream';
import { CsvImportService } from './csv-import.service';
import { CsvImportDto } from '@features/professional/domains/dtos/csv-import.dto';

const CENTER_ID = '68b4d59919d9b7a94b4fde21';
const USER_ID = '68b4d59919d9b7a94b4fde22';

describe('CsvImportService', () => {
  let service: CsvImportService;
  let csvImportRepository: { create: jest.Mock };
  let centerService: { findAllByOwnerId: jest.Mock };
  let uploadService: {
    findPublicById: jest.Mock;
    openDownloadStream: jest.Mock;
  };
  let activityService: { create: jest.Mock; findByCenterId: jest.Mock };
  let slotService: { createSlots: jest.Mock };

  const csv = (content: string) => {
    uploadService.findPublicById.mockResolvedValue({ id: 'file-1' });
    uploadService.openDownloadStream.mockReturnValue(Readable.from([content]));
  };

  const dto = (overrides: Partial<CsvImportDto> = {}): CsvImportDto =>
    ({
      entityType: 'activities',
      fileId: 'file-1',
      dryRun: false,
      centerId: CENTER_ID,
      columnMapping: {
        title: 'Titre',
        description: 'Description',
        type: 'Type',
        difficulty: 'Niveau',
        durationMinutes: 'Duree',
        priceEur: 'Prix',
      },
      ...overrides,
    }) as CsvImportDto;

  beforeEach(async () => {
    csvImportRepository = {
      create: jest.fn().mockImplementation((_dto, _pro, outcome) => ({
        getId: () => 'job-1',
        getStatus: () => outcome.status,
        getRowsTotal: () => outcome.rowsTotal,
        getRowsSuccess: () => outcome.rowsSuccess,
        getRowsErrors: () => outcome.rowsErrors,
        getErrors: () => outcome.errors,
      })),
    };
    centerService = {
      findAllByOwnerId: jest
        .fn()
        .mockResolvedValue([{ getId: () => CENTER_ID }]),
    };
    uploadService = {
      findPublicById: jest.fn(),
      openDownloadStream: jest.fn(),
    };
    activityService = {
      create: jest.fn().mockResolvedValue({ id: 'activity-1' }),
      findByCenterId: jest.fn().mockResolvedValue([]),
    };
    slotService = {
      createSlots: jest
        .fn()
        .mockResolvedValue({ createdCount: 1, slots: [], conflicts: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvImportService,
        { provide: 'ICsvImportRepository', useValue: csvImportRepository },
        { provide: 'IProfessionalCenterService', useValue: centerService },
        { provide: 'IUploadService', useValue: uploadService },
        { provide: 'IActivityService', useValue: activityService },
        { provide: 'ISlotService', useValue: slotService },
      ],
    }).compile();

    service = module.get<CsvImportService>(CsvImportService);
  });

  describe('activities', () => {
    it('creates one activity per row', async () => {
      csv(
        'Titre;Description;Type;Niveau;Duree;Prix\n' +
          'Parapente;Vol biplace;paragliding;beginner;90;120\n' +
          'Canyon;Descente;canyoning;intermediate;180;75',
      );

      const result = await service.importCsv(dto(), USER_ID);

      expect(result.rowsTotal).toBe(2);
      expect(result.rowsSuccess).toBe(2);
      expect(result.rowsErrors).toBe(0);
      expect(activityService.create).toHaveBeenCalledTimes(2);
    });

    it('imports as unpublished rather than publishing unreviewed rows', async () => {
      csv(
        'Titre;Description;Type;Niveau;Duree;Prix\nVol;Desc;x;beginner;90;10',
      );

      await service.importCsv(dto(), USER_ID);

      expect(activityService.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'unpublished' }),
        USER_ID,
        CENTER_ID,
      );
    });

    it('reports the faulty line without stopping the run', async () => {
      csv(
        'Titre;Description;Type;Niveau;Duree;Prix\n' +
          'Parapente;Vol;paragliding;beginner;90;120\n' +
          ';Sans titre;x;beginner;90;10\n' +
          'Canyon;Descente;canyoning;advanced;180;75',
      );

      const result = await service.importCsv(dto(), USER_ID);

      expect(result.rowsSuccess).toBe(2);
      expect(result.rowsErrors).toBe(1);
      // Ligne 1 = en-tetes, la ligne fautive est donc la 3.
      expect(result.errors[0]).toEqual({
        line: 3,
        column: 'Titre',
        reason: 'Titre manquant',
      });
    });

    it('rejects an unknown difficulty', async () => {
      csv('Titre;Description;Type;Niveau;Duree;Prix\nVol;Desc;x;facile;90;10');

      const result = await service.importCsv(dto(), USER_ID);

      expect(result.rowsErrors).toBe(1);
      expect(result.errors[0].reason).toContain('facile');
    });

    it('accepts a decimal price written with a comma', async () => {
      csv(
        'Titre;Description;Type;Niveau;Duree;Prix\nVol;Desc;x;beginner;90;"12,50"',
      );

      await service.importCsv(dto(), USER_ID);

      expect(activityService.create).toHaveBeenCalledWith(
        expect.objectContaining({ priceEur: 12.5 }),
        USER_ID,
        CENTER_ID,
      );
    });

    it('writes nothing on a dry run', async () => {
      csv(
        'Titre;Description;Type;Niveau;Duree;Prix\nVol;Desc;x;beginner;90;10',
      );

      const result = await service.importCsv(dto({ dryRun: true }), USER_ID);

      expect(result.rowsSuccess).toBe(1);
      expect(activityService.create).not.toHaveBeenCalled();
    });
  });

  describe('slots', () => {
    const slotDto = () =>
      dto({
        entityType: 'slots',
        columnMapping: {
          activityTitle: 'Activite',
          startAt: 'Debut',
          maxParticipants: 'Places',
        },
      });

    it('attaches the slot to the activity named in the row', async () => {
      activityService.findByCenterId.mockResolvedValue([
        {
          getId: () => 'activity-1',
          getTitle: () => 'Parapente',
          getDurationMinutes: () => 90,
          getPriceEur: () => 120,
        },
      ]);
      csv(
        'Activite;Debut;Duree;Places;Prix\nParapente;15/07/2026 09:00;90;8;120',
      );

      const result = await service.importCsv(slotDto(), USER_ID);

      expect(result.rowsSuccess).toBe(1);
      // Duree et prix viennent de l'activite : le fichier ne les porte pas.
      expect(slotService.createSlots).toHaveBeenCalledWith(
        'activity-1',
        USER_ID,
        expect.objectContaining({
          maxParticipants: 8,
          durationMinutes: 90,
          priceEur: 120,
        }),
      );
    });

    it('matches the activity title regardless of case', async () => {
      activityService.findByCenterId.mockResolvedValue([
        {
          getId: () => 'activity-1',
          getTitle: () => 'Parapente',
          getDurationMinutes: () => 90,
          getPriceEur: () => 120,
        },
      ]);
      csv(
        'Activite;Debut;Duree;Places;Prix\nPARAPENTE;15/07/2026 09:00;90;8;120',
      );

      const result = await service.importCsv(slotDto(), USER_ID);

      expect(result.rowsSuccess).toBe(1);
    });

    it('reports a row naming an activity the center does not have', async () => {
      activityService.findByCenterId.mockResolvedValue([]);
      csv(
        'Activite;Debut;Duree;Places;Prix\nInconnue;15/07/2026 09:00;90;8;120',
      );

      const result = await service.importCsv(slotDto(), USER_ID);

      expect(result.rowsErrors).toBe(1);
      expect(result.errors[0].reason).toContain('Inconnue');
    });

    it('rejects an unreadable date', async () => {
      activityService.findByCenterId.mockResolvedValue([
        {
          getId: () => 'activity-1',
          getTitle: () => 'Parapente',
          getDurationMinutes: () => 90,
          getPriceEur: () => 120,
        },
      ]);
      csv('Activite;Debut;Places\nParapente;pas une date;8');

      const result = await service.importCsv(slotDto(), USER_ID);

      expect(result.errors[0].reason).toBe('Date de début invalide');
    });
  });

  describe('guards', () => {
    it('refuses a center the professional does not own', async () => {
      centerService.findAllByOwnerId.mockResolvedValue([
        { getId: () => 'another-center' },
      ]);

      await expect(service.importCsv(dto(), USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('refuses an empty column mapping', async () => {
      await expect(
        service.importCsv(dto({ columnMapping: {} }), USER_ID),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('refuses customers, which are not supported yet', async () => {
      await expect(
        service.importCsv(dto({ entityType: 'customers' }), USER_ID),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('refuses a file with no data row', async () => {
      csv('Titre;Description;Type;Niveau;Duree;Prix');

      await expect(service.importCsv(dto(), USER_ID)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
