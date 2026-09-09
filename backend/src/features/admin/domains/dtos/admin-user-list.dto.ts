import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const ADMIN_USERS_DEFAULT_LIMIT = 20;
export const ADMIN_USERS_MAX_LIMIT = 100;

export class AdminUserListQueryDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({
    required: false,
    default: ADMIN_USERS_DEFAULT_LIMIT,
    minimum: 1,
    maximum: ADMIN_USERS_MAX_LIMIT,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}

/**
 * Vue administrateur d'un compte (US-22).
 *
 * Volontairement limitee aux champs necessaires au back-office : aucun secret
 * (mot de passe, refresh token, jetons de verification) n'y figure.
 */
export class AdminUserListItemDto {
  @ApiProperty({ example: '68b4d59919d9b7a94b4fde21' })
  id: string;

  @ApiProperty({ example: 'marie.dupont@example.com' })
  email: string;

  @ApiProperty({ example: 'Marie' })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  lastName: string;

  @ApiProperty({ example: 'aventurier' })
  role: string;

  @ApiProperty({ example: 'active', enum: ['active', 'suspended', 'banned'] })
  status: string;

  @ApiProperty({ example: '2026-08-19T21:51:00.000Z' })
  createdAt: string;
}

export class AdminUserListMetaDto {
  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class AdminUserListResponseDto {
  @ApiProperty({ type: [AdminUserListItemDto] })
  data: AdminUserListItemDto[];

  @ApiProperty({ type: AdminUserListMetaDto })
  meta: AdminUserListMetaDto;
}
