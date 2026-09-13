import type { ProBookingRepository } from '../../domain/repositories/pro-booking.repository';
import type { ProBookingEntity } from '../../domain/entities/pro-booking.entity';
import ProBookingApi from '../datasources/pro-booking.api';
import ProBookingMapper from '../mappers/pro-booking.mapper';

class ProBookingRepositoryImpl implements ProBookingRepository {
  constructor(
    private readonly api: ProBookingApi = new ProBookingApi(),
    private readonly mapper: ProBookingMapper = new ProBookingMapper(),
  ) {}

  async getByCenter(centerId: string): Promise<ProBookingEntity[]> {
    const dtos = await this.api.getByCenter(centerId);
    return (dtos ?? []).map((dto) => this.mapper.toEntity(dto));
  }
}

export default ProBookingRepositoryImpl;
