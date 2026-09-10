import type { LoginRepository } from '../../domain/repositories/login.repository';
import type { LoginEntity } from '../../domain/entities/login.entity';
import type { LoginRequestDto } from '../dtos/login.dto';
import LoginApi from '../datasources/login.api';
import LoginMapper from '../mappers/login.mapper';

class LoginRepositoryImpl implements LoginRepository {
  constructor(
    private readonly loginApi: LoginApi = new LoginApi(),
    private readonly loginMapper: LoginMapper = new LoginMapper(),
  ) {}

  async login(data: LoginRequestDto): Promise<LoginEntity> {
    const dto = await this.loginApi.login(data);
    return this.loginMapper.toEntity(dto);
  }
}

export default LoginRepositoryImpl;
