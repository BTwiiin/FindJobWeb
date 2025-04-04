import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostController } from './job-post.controller';
import { JobPostService } from './job-post.service';
import { SearchModule } from '../search/search.module';
import { CalendarModule } from '../calendar/calendar.module';
import { JobPost } from '../entities/job-post.entity';
import { SavedPost } from '../entities/saved-post.entity';
import { Location } from '../entities/location.entity';
import { User } from '../entities/user.entity';
import { JobApplication } from 'src/entities/job-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPost, SavedPost, Location, User, JobApplication]),
    forwardRef(() => SearchModule),
    CalendarModule
  ],  
  controllers: [JobPostController],
  providers: [JobPostService],
  exports: [JobPostService]
})
export class JobPostModule {}
