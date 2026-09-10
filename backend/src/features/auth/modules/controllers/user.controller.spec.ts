import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserEntity } from '@features/auth/domains/entities/user.entity';
import {
  CreateUserDto,
  DashboardResponseDto,
  UpdateUserDto,
} from '@features/auth/domains/dtos/user.dto';

/**
 * Mock du service injecte via le token string 'IUserService'.
 * Seules les methodes utilisees par le controller sont mockees.
 */
interface UserServiceMock {
  getDashboard: jest.Mock;
  findAll: jest.Mock;
  findById: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}

/**
 * Requete authentifiee minimale, telle qu'injectee par AccessTokenGuard.
 */
interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

describe('UserController', () => {
  let controller: UserController;
  let userService: UserServiceMock;

  const OWNER_ID = '68b4d59919d9b7a94b4fde21';
  const OTHER_ID = '68b4d59919d9b7a94b4fde99';

  /**
   * Construit une fausse entite exposant uniquement les getters consommes par
   * UserResponseDto.fromEntity.
   */
  const buildEntity = (
    overrides: { id?: string; birthDate?: Date | string } = {},
  ): UserEntity =>
    ({
      getId: () => overrides.id ?? OWNER_ID,
      getEmail: () => 'user@example.com',
      getFirstName: () => 'Jean',
      getLastName: () => 'Dupont',
      getBirthDate: () => overrides.birthDate ?? new Date('1995-05-15'),
      getRole: () => 'aventurier',
      getStatus: () => 'active',
      getEmailVerified: () => true,
      getAcceptCgu: () => true,
      getAcceptRgpd: () => true,
      getTwoFactorEnabled: () => false,
    }) as unknown as UserEntity;

  const buildRequest = (
    sub: string,
    role: string = 'aventurier',
  ): AuthenticatedRequest => ({
    user: { sub, email: 'user@example.com', role },
  });

  beforeEach(async () => {
    userService = {
      getDashboard: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: 'IUserService',
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard()', () => {
    it('should return the dashboard of the authenticated user', async () => {
      const expected: DashboardResponseDto = {
        firstName: 'Jean',
        upcomingBookings: [],
        suggestedActivities: [],
      };
      userService.getDashboard.mockResolvedValue(expected);

      const result = await controller.getDashboard(buildRequest(OWNER_ID));

      expect(userService.getDashboard).toHaveBeenCalledWith(OWNER_ID);
      expect(result).toBe(expected);
    });

    it('should propagate service errors', async () => {
      const error = new NotFoundException('Utilisateur introuvable');
      userService.getDashboard.mockRejectedValue(error);

      await expect(
        controller.getDashboard(buildRequest(OWNER_ID)),
      ).rejects.toBe(error);
    });
  });

  describe('findAll()', () => {
    it('should map every entity to a UserResponseDto', async () => {
      userService.findAll.mockResolvedValue([
        buildEntity(),
        buildEntity({ id: OTHER_ID }),
      ]);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(OWNER_ID);
      expect(result[1].id).toBe(OTHER_ID);
      expect(result[0].email).toBe('user@example.com');
      expect(result[0]).not.toHaveProperty('password');
    });

    it('should return an empty array when the service returns null', async () => {
      userService.findAll.mockResolvedValue(null);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should propagate a 403 raised for a non admin caller', async () => {
      const error = new ForbiddenException('Reserve aux administrateurs');
      userService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toBe(error);
    });
  });

  describe('findById()', () => {
    it('should return the user when the caller is the owner', async () => {
      userService.findById.mockResolvedValue(buildEntity());

      const result = await controller.findById(
        OWNER_ID,
        buildRequest(OWNER_ID),
      );

      expect(userService.findById).toHaveBeenCalledWith(OWNER_ID);
      expect(result.id).toBe(OWNER_ID);
    });

    it('should return the user when the caller is an admin', async () => {
      userService.findById.mockResolvedValue(buildEntity({ id: OTHER_ID }));

      const result = await controller.findById(
        OTHER_ID,
        buildRequest(OWNER_ID, 'admin'),
      );

      expect(result.id).toBe(OTHER_ID);
    });

    it('should accept an admin role written in upper case', async () => {
      userService.findById.mockResolvedValue(buildEntity({ id: OTHER_ID }));

      await expect(
        controller.findById(OTHER_ID, buildRequest(OWNER_ID, 'ADMIN')),
      ).resolves.toBeDefined();
    });

    it('should serialize a non Date birthDate as a string', async () => {
      userService.findById.mockResolvedValue(
        buildEntity({ birthDate: '1995-05-15' }),
      );

      const result = await controller.findById(
        OWNER_ID,
        buildRequest(OWNER_ID),
      );

      expect(result.birthDate).toBe('1995-05-15');
    });

    it('should throw a 403 when a non admin targets another account', async () => {
      await expect(
        controller.findById(OTHER_ID, buildRequest(OWNER_ID)),
      ).rejects.toThrow(ForbiddenException);
      expect(userService.findById).not.toHaveBeenCalled();
    });

    it('should throw a 403 when the request carries no user', async () => {
      await expect(
        controller.findById(OTHER_ID, {} as AuthenticatedRequest),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw a 404 when the user does not exist', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(
        controller.findById(OWNER_ID, buildRequest(OWNER_ID)),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    const dto: CreateUserDto = {
      email: 'user@example.com',
      password: 'Str0ng!Passw0rd',
      firstName: 'Jean',
      lastName: 'Dupont',
      birthDate: '1995-05-15',
      acceptCgu: true,
      acceptRgpd: true,
    } as CreateUserDto;

    it('should delegate the creation to the user service', async () => {
      userService.create.mockResolvedValue(true);

      const result = await controller.create(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });

    it('should propagate a 409 when the email is already used', async () => {
      const error = new Error('Email deja utilise');
      userService.create.mockRejectedValue(error);

      await expect(controller.create(dto)).rejects.toBe(error);
    });
  });

  describe('update()', () => {
    const dto: UpdateUserDto = { firstName: 'Jeanne' };

    it('should update the account when the caller is the owner', async () => {
      userService.update.mockResolvedValue(true);

      const result = await controller.update(
        OWNER_ID,
        dto,
        buildRequest(OWNER_ID),
      );

      expect(userService.update).toHaveBeenCalledWith(OWNER_ID, dto);
      expect(result).toBe(true);
    });

    it('should update any account when the caller is an admin', async () => {
      userService.update.mockResolvedValue(true);

      const result = await controller.update(
        OTHER_ID,
        dto,
        buildRequest(OWNER_ID, 'admin'),
      );

      expect(userService.update).toHaveBeenCalledWith(OTHER_ID, dto);
      expect(result).toBe(true);
    });

    it('should throw a 403 when a non admin updates another account', async () => {
      await expect(
        controller.update(OTHER_ID, dto, buildRequest(OWNER_ID)),
      ).rejects.toThrow(ForbiddenException);
      expect(userService.update).not.toHaveBeenCalled();
    });

    it('should propagate a 404 raised by the service', async () => {
      const error = new NotFoundException('Utilisateur introuvable');
      userService.update.mockRejectedValue(error);

      await expect(
        controller.update(OWNER_ID, dto, buildRequest(OWNER_ID)),
      ).rejects.toBe(error);
    });
  });

  describe('delete()', () => {
    it('should delegate the deletion to the user service', async () => {
      userService.delete.mockResolvedValue(true);

      const result = await controller.delete(OWNER_ID);

      expect(userService.delete).toHaveBeenCalledWith(OWNER_ID);
      expect(result).toBe(true);
    });

    it('should propagate a 404 when the user does not exist', async () => {
      const error = new NotFoundException('Utilisateur introuvable');
      userService.delete.mockRejectedValue(error);

      await expect(controller.delete(OWNER_ID)).rejects.toBe(error);
    });
  });
});
