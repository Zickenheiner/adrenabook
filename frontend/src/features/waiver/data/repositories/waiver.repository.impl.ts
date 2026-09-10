import type { WaiverRepository } from '../../domain/repositories/waiver.repository';
import type { WaiverEntity } from '../../domain/entities/waiver.entity';
import type { SignWaiverRequestDto } from '../dtos/waiver.dto';
import WaiverApi from '../datasources/waiver.api';
import WaiverMapper from '../mappers/waiver.mapper';

class WaiverRepositoryImpl implements WaiverRepository {
  constructor(
    private readonly waiverApi: WaiverApi = new WaiverApi(),
    private readonly waiverMapper: WaiverMapper = new WaiverMapper(),
  ) {}

  async sign(
    bookingId: string,
    data: SignWaiverRequestDto,
  ): Promise<WaiverEntity> {
    const dto = await this.waiverApi.sign(bookingId, data);
    return this.waiverMapper.toEntity(dto);
  }
}

export default WaiverRepositoryImpl;
