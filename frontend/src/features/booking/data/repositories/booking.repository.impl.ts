import type { BookingRepository } from '../../domain/repositories/booking.repository';
import type { BookingEntity } from '../../domain/entities/booking.entity';
import type { CreateBookingRequestDto } from '../dtos/booking.dto';
import BookingApi from '../datasources/booking.api';
import BookingMapper from '../mappers/booking.mapper';

class BookingRepositoryImpl implements BookingRepository {
  constructor(
    private readonly api: BookingApi = new BookingApi(),
    private readonly mapper: BookingMapper = new BookingMapper(),
  ) {}

  async create(data: CreateBookingRequestDto): Promise<BookingEntity> {
    const dto = await this.api.create(data);
    return this.mapper.toEntity(dto);
  }
}

export default BookingRepositoryImpl;
