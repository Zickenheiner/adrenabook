import type { HealthEntity } from '../../domain/entities/health.entity';
import type { HealthCheckResponseDto } from '../dtos/health.dto';

class HealthMapper {
  toEntity(dto: HealthCheckResponseDto): HealthEntity {
    return {
      status: dto.status,
      version: dto.version,
      uptime: dto.uptime,
      checks: {
        mongodb: dto.checks.mongodb,
        rabbitmq: dto.checks.rabbitmq,
        stripe: dto.checks.stripe,
        sendgrid: dto.checks.sendgrid,
      },
      responseTimeMs: dto.responseTimeMs,
      checkedAt: new Date(),
    };
  }
}

export default HealthMapper;
