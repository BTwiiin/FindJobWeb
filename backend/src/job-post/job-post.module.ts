import { Module } from '@nestjs/common';
import { JobPostController } from './job-post.controller';
import { JobPostService } from './job-post.service';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [JobPostController],
  providers: [JobPostService],
  exports: [JobPostService],
})
export class JobPostModule {}
