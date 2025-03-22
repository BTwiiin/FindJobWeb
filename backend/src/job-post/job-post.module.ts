import { Module, forwardRef } from '@nestjs/common';
import { JobPostController } from './job-post.controller';
import { JobPostService } from './job-post.service';
import { SearchModule } from '../search/search.module';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [forwardRef(() => SearchModule), DatabaseModule],
  controllers: [JobPostController],
  providers: [JobPostService],
  exports: [JobPostService],
})
export class JobPostModule {}
