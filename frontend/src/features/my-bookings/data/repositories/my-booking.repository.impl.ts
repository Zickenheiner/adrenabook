import type { MyBookingRepository } from '../../domain/repositories/my-booking.repository';
import type { MyBookingEntity } from '../../domain/entities/my-booking.entity';
import MyBookingApi from '../datasources/my-booking.api';
import MyBookingMapper from '../mappers/my-booking.mapper';

class MyBookingRepositoryImpl implements MyBookingRepository {
  constructor(
    private readonly api: MyBookingApi = new MyBookingApi(),
    private readonly mapper: MyBookingMapper = new MyBookingMapper(),
  ) {}

  async getMine(): Promise<MyBookingEntity[]> {
    const dtos = await this.api.getMine();
    return (dtos ?? []).map((dto) => this.mapper.toEntity(dto));
  }
}

export default MyBookingRepositoryImpl;
