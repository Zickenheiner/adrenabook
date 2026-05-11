import type { RegisterRepository } from '../../domain/repositories/register.repository';
import type { RegisterEntity } from '../../domain/entities/register.entity';
import type { RegisterRequestDto } from '../dtos/register.dto';
import RegisterApi from '../datasources/register.api';
import RegisterMapper from '../mappers/register.mapper';

class RegisterRepositoryImpl implements RegisterRepository {
  constructor(
    private readonly registerApi: RegisterApi = new RegisterApi(),
    private readonly registerMapper: RegisterMapper = new RegisterMapper(),
  ) {}

  async register(data: RegisterRequestDto): Promise<RegisterEntity> {
    const dto = await this.registerApi.register(data);
    return this.registerMapper.toEntity(dto);
  }
}

export default RegisterRepositoryImpl;
