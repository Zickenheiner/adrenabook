import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { IUserService } from '../../../interfaces/services/user.iservice';
import { IUserRepository } from '@features/auth/interfaces/repositories/user.irepository';
import {
  CreateUserDto,
  RegisterDto,
  RegisterResponseDto,
  UpdateUserDto,
} from '@features/auth/domains/dtos/user.dto';
import { UserEntity } from '@features/auth/domains/entities/user.entity';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findAll(): Promise<UserEntity[] | null> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    // Verifier que les CGU et RGPD sont acceptes (double check, deja valide par DTO)
    if (!dto.acceptCgu || !dto.acceptRgpd) {
      throw new BadRequestException(
        'Vous devez accepter les CGU et la politique RGPD',
      );
    }

    // Verifier que l'utilisateur est majeur (18 ans minimum)
    const birthDate = new Date(dto.birthDate);
    if (isNaN(birthDate.getTime())) {
      throw new BadRequestException('La date de naissance est invalide');
    }
    const age = this.computeAge(birthDate);
    if (age < 18) {
      throw new BadRequestException(
        'Vous devez etre majeur (18 ans minimum) pour vous inscrire',
      );
    }

    // Verifier que l'email n'est pas deja utilise
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Cet email est deja utilise');
    }

    // Hasher le mot de passe avec argon2
    const hashedPassword = await argon2.hash(dto.password);

    // Generer un token de verification email
    const emailVerificationToken = randomBytes(32).toString('hex');

    // Persister le nouvel utilisateur
    const created = await this.userRepository.register(
      dto,
      hashedPassword,
      emailVerificationToken,
    );

    if (!created) {
      throw new InternalServerErrorException(
        "Impossible de creer l'utilisateur",
      );
    }

    // TODO: integrer l'envoi reel d'email de verification (SendGrid, etc.)
    // Pour l'instant on retourne emailVerificationSent: true en supposant l'envoi reussi
    const emailVerificationSent = true;

    return {
      userId: created.getId(),
      email: created.getEmail(),
      emailVerificationSent,
    };
  }

  async create(dto: CreateUserDto): Promise<boolean> {
    return this.userRepository.create(dto);
  }

  async update(id: string, dto: UpdateUserDto): Promise<boolean> {
    return this.userRepository.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  private computeAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
