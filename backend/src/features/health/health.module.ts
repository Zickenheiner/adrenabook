import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './modules/controllers/health.controller';
import { HealthService } from './modules/implementation/services/health.service';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
  providers: [
    {
      provide: 'IHealthService',
      useClass: HealthService,
    },
  ],
  exports: ['IHealthService'],
})
export class HealthBaseModule {}
