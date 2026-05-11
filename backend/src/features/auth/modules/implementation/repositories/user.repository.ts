import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../interfaces/repositories/user.irepository';
import { UserMapper } from '../mappers/user.mapper';
import { User, UserDocument } from '@features/auth/domains/schemas/user.schema';
import { Model } from 'mongoose';
import {
  CreateUserDto,
  RegisterDto,
  UpdateUserDto,
} from '@features/auth/domains/dtos/user.dto';
import { UserEntity } from '@features/auth/domains/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly userMapper: UserMapper,
  ) {}

  async findAll(): Promise<UserEntity[] | null> {
    const users = await this.userModel.find().exec();
    return users ? users.map((doc) => this.userMapper.toEntity(doc)) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.userMapper.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
    return user ? this.userMapper.toEntity(user) : null;
  }

  async register(
    dto: RegisterDto,
    hashedPassword: string,
    emailVerificationToken: string,
  ): Promise<UserEntity | null> {
    const document = new this.userModel({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      birthDate: new Date(dto.birthDate),
      acceptCgu: dto.acceptCgu,
      acceptRgpd: dto.acceptRgpd,
      emailVerified: false,
      emailVerificationToken,
      role: 'Aventurier',
      failedLoginAttempts: 0,
      twoFactorEnabled: false,
    });
    const created = await document.save();
    return created ? this.userMapper.toEntity(created) : null;
  }

  async create(dto: CreateUserDto): Promise<boolean> {
    const document = new this.userModel(dto);
    const createdUser = await document.save();
    return !!createdUser;
  }

  async update(id: string, dto: UpdateUserDto): Promise<boolean> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return !!updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  // ——— Securite US-02 ———

  async incrementFailedAttempts(id: string): Promise<UserEntity | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { $inc: { failedLoginAttempts: 1 } },
        { new: true },
      )
      .exec();
    return updated ? this.userMapper.toEntity(updated) : null;
  }

  async lockAccount(id: string, lockedUntil: Date): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { lockedUntil }, { new: true })
      .exec();
    return !!updated;
  }

  async resetFailedAttempts(id: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { failedLoginAttempts: 0, $unset: { lockedUntil: '' } },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async setTwoFactorCode(
    id: string,
    code: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { twoFactorCode: code, twoFactorCodeExpiresAt: expiresAt },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async clearTwoFactorCode(id: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { $unset: { twoFactorCode: '', twoFactorCodeExpiresAt: '' } },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async setRefreshTokenHash(id: string, hash: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { refreshTokenHash: hash }, { new: true })
      .exec();
    return !!updated;
  }

  // ——— Reinitialisation mot de passe US-03 ———

  async setPasswordResetToken(
    id: string,
    hashedToken: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          passwordResetTokenHash: hashedToken,
          passwordResetTokenExpiresAt: expiresAt,
        },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async clearPasswordResetToken(id: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          $unset: {
            passwordResetTokenHash: '',
            passwordResetTokenExpiresAt: '',
          },
        },
        { new: true },
      )
      .exec();
    return !!updated;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
      .exec();
    return !!updated;
  }

  async clearRefreshTokenHash(id: string): Promise<boolean> {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { $unset: { refreshTokenHash: '' } },
        { new: true },
      )
      .exec();
    return !!updated;
  }
}
