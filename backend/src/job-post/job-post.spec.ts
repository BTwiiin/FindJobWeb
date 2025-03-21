import { Test, TestingModule } from '@nestjs/testing';
import { JobPost } from '../entities/job-post.entity';

describe('JobPost', () => {
  let provider: JobPost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobPost],
    }).compile();

    provider = module.get<JobPost>(JobPost);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
