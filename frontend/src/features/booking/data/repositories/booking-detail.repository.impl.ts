import type { BookingDetailRepository } from '../../domain/repositories/booking-detail.repository';
import type { BookingDetailEntity } from '../../domain/entities/booking-detail.entity';
import BookingDetailApi from '../datasources/booking-detail.api';
import BookingDetailMapper from '../mappers/booking-detail.mapper';

class BookingDetailRepositoryImpl implements BookingDetailRepository {
  constructor(
    private readonly api: BookingDetailApi = new BookingDetailApi(),
    private readonly mapper: BookingDetailMapper = new BookingDetailMapper(),
  ) {}

  async getById(id: string): Promise<BookingDetailEntity> {
    const dto = await this.api.getById(id);
    return this.mapper.toEntity(dto);
  }
}

export default BookingDetailRepositoryImpl;
