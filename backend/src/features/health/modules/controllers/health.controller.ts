import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '@core/decorators/public.decorator';
import { IHealthService } from '@features/health/interfaces/services/health.iservice';
import { HealthCheckResponseDto } from '@features/health/domains/dtos/health.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject('IHealthService')
    private readonly healthService: IHealthService,
  ) {}

  @ApiOperation({
    summary: 'Service health check',
    description:
      'Returns the global health status of the service. MongoDB connectivity is really tested (ok/fail); Stripe and SendGrid are only checked for credentials presence (configured/not_configured), no network call is made to those providers. Used by Kubernetes liveness/readiness probes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    type: HealthCheckResponseDto,
  })
  @ApiResponse({
    status: 503,
    description:
      'Service is degraded or down (used by Kubernetes probes to trigger rollback)',
    type: HealthCheckResponseDto,
  })
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async check(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthCheckResponseDto> {
    const result = await this.healthService.check();

    // Seul un etat "down" (dependance critique injoignable) doit signaler
    // l'indisponibilite du service. Un etat "degraded" — un service externe
    // optionnel non configure, par exemple — reste un 200 : le detail est
    // dans le corps de la reponse, et une sonde ne doit pas retirer
    // l'application de la rotation pour autant.
    if (result.status === 'down') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }
}
