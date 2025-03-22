import { Controller, Get, Query, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchParams } from './interfaces/search-params.interface';
import { JobPostService } from '../job-post/job-post.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly jobPostService: JobPostService,
  ) {}

  @Get()
  async search(@Query() searchParams: SearchParams) {
    return this.searchService.search(searchParams);
  }

  @Post('reindex')
  async reindexAll() {
    const jobPosts = await this.jobPostService.findAll();
    await this.searchService.reindexAll(jobPosts);
    return { message: 'Reindexing completed successfully' };
  }
} 