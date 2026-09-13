import type { CenterDetailEntity } from '../../domain/entities/center-detail.entity';
import type { CenterDetailResponseDto } from '../dtos/center-detail.dto';

class CenterDetailMapper {
  toEntity(dto: CenterDetailResponseDto): CenterDetailEntity {
    return { ...dto };
  }
}

export default CenterDetailMapper;
