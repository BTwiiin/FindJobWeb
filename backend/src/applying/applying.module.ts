import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplyingController } from './applying.controller';
import { ApplyingService } from './applying.service';
import { JobApplication } from '../entities/job-application.entity';
import { JobPost } from '../entities/job-post.entity';
import { SearchModule } from '../search/search.module';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, JobPost]),
    SearchModule,
    CalendarModule,
  ],
  controllers: [ApplyingController],
  providers: [ApplyingService],
  exports: [ApplyingService]
})
export class ApplyingModule {} 