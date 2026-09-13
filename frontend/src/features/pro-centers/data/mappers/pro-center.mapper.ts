import type {
  ProCenterEntity,
  ProCenterStatus,
} from '../../domain/entities/pro-center.entity';
import type { ProCenterResponseDto } from '../dtos/pro-center.dto';

class ProCenterMapper {
  toEntity(dto: ProCenterResponseDto): ProCenterEntity {
    return {
      id: dto.id,
      name: dto.companyName,
      city: dto.address?.city ?? '',
      status: dto.status as ProCenterStatus,
    };
  }
}

export default ProCenterMapper;
