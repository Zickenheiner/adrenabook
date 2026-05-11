import { Module } from '@nestjs/common';
import { AdminBaseModule } from './modules/center-review.module';

@Module({
  imports: [AdminBaseModule],
  exports: [AdminBaseModule],
})
export class AdminModule {}
