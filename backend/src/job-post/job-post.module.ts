import { Module, forwardRef } from '@nestjs/common';
import { JobPostController } from './job-post.controller';
import { JobPostService } from './job-post.service';
import { DatabaseModule } from '../common/database/database.module';
import { SearchModule } from '../search/search.module';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => SearchModule),
    CalendarModule
  ],
  controllers: [JobPostController],
  providers: [JobPostService],
  exports: [JobPostService]
})
export class JobPostModule {}
