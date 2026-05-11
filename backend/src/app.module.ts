import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from '@core/guards/access-token.guard';
import { AtStrategy } from '@core/strategies/at.strategy';
import { HealthBaseModule } from '@features/health/health.module';
import { UserBaseModule } from '@features/auth/modules/user.module';
import { ProfessionalModule } from '@features/professional/professional.module';
import { AdminModule } from '@features/admin/admin.module';
import { SlotBaseModule } from '@features/slot/modules/slot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      ignoreEnvFile: false,
      expandVariables: true,
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    HealthBaseModule,
    UserBaseModule,
    ProfessionalModule,
    AdminModule,
    SlotBaseModule,
  ],
  providers: [
    AtStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
