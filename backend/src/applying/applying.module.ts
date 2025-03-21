import { Module } from '@nestjs/common';
import { ApplyingController } from './applying.controller';
import { ApplyingService } from './applying.service';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [ApplyingController],
  providers: [ApplyingService],
  exports: [ApplyingService]
})
export class ApplyingModule {} 