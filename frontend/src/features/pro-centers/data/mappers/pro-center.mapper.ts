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
      address: {
        street: dto.address?.street ?? '',
        city: dto.address?.city ?? '',
        postalCode: dto.address?.postalCode ?? '',
        country: dto.address?.country ?? '',
      },
      contactEmail: dto.contactEmail ?? '',
      contactPhone: dto.contactPhone ?? '',
      status: dto.status as ProCenterStatus,
      activitiesCount: dto.activitiesCount ?? 0,
    };
  }
}

export default ProCenterMapper;
