import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfessionalCenterController } from './professional-center.controller';
import { IProfessionalCenterService } from '@features/professional/interfaces/services/professional-center.iservice';
import { ProfessionalCenterEntity } from '@features/professional/domains/entities/professional-center.entity';
import {
  CreateProfessionalCenterDto,
  UpdateProfessionalCenterDto,
} from '@features/professional/domains/dtos/professional-center.dto';

describe('ProfessionalCenterController', () => {
  let controller: ProfessionalCenterController;
  let professionalCenterService: jest.Mocked<IProfessionalCenterService>;

  const ownerId = '68b4d59919d9b7a94b4fde10';
  const centerId = '68b4d59919d9b7a94b4fde21';

  // Requete authentifiee minimale telle que fournie par le guard JWT
  const buildRequest = (sub: string): { user: { sub: string } } => ({
    user: { sub },
  });

  beforeEach(async () => {
    const serviceMock: jest.Mocked<IProfessionalCenterService> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByOwnerId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalCenterController],
      providers: [
        {
          provide: 'IProfessionalCenterService',
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ProfessionalCenterController>(
      ProfessionalCenterController,
    );
    professionalCenterService = module.get('IProfessionalCenterService');
  });

  const buildDto = (): CreateProfessionalCenterDto => ({
    companyName: 'Alpes Aventures SARL',
    siret: '73282932000074',
    contactEmail: 'contact@alpesaventures.fr',
    contactPhone: '+33450000000',
    address: {
      street: '12 Rue de la Montagne',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France',
    },
    legalRepresentative: {
      firstName: 'Marie',
      lastName: 'Durand',
      role: 'Gérante',
    },
    documents: {
      kbisFileId: 'file_abc123',
      rcProFileId: 'file_def456',
      instructorDiplomas: ['file_dip001'],
    },
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return every professional center', async () => {
      const centers = [
        new ProfessionalCenterEntity(centerId as never),
        new ProfessionalCenterEntity('68b4d59919d9b7a94b4fde22' as never),
      ];
      professionalCenterService.findAll.mockResolvedValue(centers);

      const result = await controller.findAll();

      expect(result).toBe(centers);
      expect(professionalCenterService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return null when the service has nothing to return', async () => {
      professionalCenterService.findAll.mockResolvedValue(null);

      await expect(controller.findAll()).resolves.toBeNull();
    });

    it('should propagate a ForbiddenException raised by the service', async () => {
      professionalCenterService.findAll.mockRejectedValue(
        new ForbiddenException('Accès réservé aux administrateurs'),
      );

      await expect(controller.findAll()).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findById()', () => {
    it('should return the professional center with the given id', async () => {
      const entity = new ProfessionalCenterEntity(centerId as never);
      professionalCenterService.findById.mockResolvedValue(entity);

      const result = await controller.findById(centerId);

      expect(result).toBe(entity);
      expect(professionalCenterService.findById).toHaveBeenCalledWith(centerId);
    });

    it('should return null when the center does not exist', async () => {
      professionalCenterService.findById.mockResolvedValue(null);

      await expect(controller.findById('unknown')).resolves.toBeNull();
    });

    it('should propagate a NotFoundException raised by the service', async () => {
      professionalCenterService.findById.mockRejectedValue(
        new NotFoundException('Centre introuvable'),
      );

      await expect(controller.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create()', () => {
    it('should create the center for the authenticated owner', async () => {
      professionalCenterService.create.mockResolvedValue(true);
      const dto = buildDto();

      const result = await controller.create(dto, buildRequest(ownerId));

      expect(result).toBe(true);
      expect(professionalCenterService.create).toHaveBeenCalledWith(
        dto,
        ownerId,
      );
    });

    it('should forward the owner id read from the request', async () => {
      professionalCenterService.create.mockResolvedValue(true);

      await controller.create(buildDto(), buildRequest('another-owner'));

      expect(professionalCenterService.create).toHaveBeenCalledWith(
        expect.anything(),
        'another-owner',
      );
    });

    it('should propagate a ConflictException when the SIRET already exists', async () => {
      professionalCenterService.create.mockRejectedValue(
        new ConflictException('SIRET déjà enregistré'),
      );

      await expect(
        controller.create(buildDto(), buildRequest(ownerId)),
      ).rejects.toThrow(ConflictException);
    });

    it('should propagate an UnauthorizedException raised by the service', async () => {
      professionalCenterService.create.mockRejectedValue(
        new UnauthorizedException('Authentification requise'),
      );

      await expect(
        controller.create(buildDto(), buildRequest(ownerId)),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update()', () => {
    const dto: UpdateProfessionalCenterDto = {
      companyName: 'Alpes Aventures SAS',
    };

    it('should update the center and return true', async () => {
      professionalCenterService.update.mockResolvedValue(true);

      const result = await controller.update(centerId, dto);

      expect(result).toBe(true);
      expect(professionalCenterService.update).toHaveBeenCalledWith(
        centerId,
        dto,
      );
    });

    it('should return false when no center was updated', async () => {
      professionalCenterService.update.mockResolvedValue(false);

      await expect(controller.update('unknown', dto)).resolves.toBe(false);
    });

    it('should propagate a ForbiddenException when the center belongs to someone else', async () => {
      professionalCenterService.update.mockRejectedValue(
        new ForbiddenException('Centre appartenant à un autre professionnel'),
      );

      await expect(controller.update(centerId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete()', () => {
    it('should delete the center and return true', async () => {
      professionalCenterService.delete.mockResolvedValue(true);

      const result = await controller.delete(centerId);

      expect(result).toBe(true);
      expect(professionalCenterService.delete).toHaveBeenCalledWith(centerId);
    });

    it('should return false when no center was deleted', async () => {
      professionalCenterService.delete.mockResolvedValue(false);

      await expect(controller.delete('unknown')).resolves.toBe(false);
    });

    it('should propagate a NotFoundException raised by the service', async () => {
      professionalCenterService.delete.mockRejectedValue(
        new NotFoundException('Centre introuvable'),
      );

      await expect(controller.delete('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
