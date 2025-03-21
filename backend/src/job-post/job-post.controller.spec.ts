import { Test, TestingModule } from '@nestjs/testing';
import { JobPostController } from './job-post.controller';
import { JobPostService } from './job-post.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JobPostCategory } from '../entities/enums/job-post-category.enum';

describe('JobPostController', () => {
  let controller: JobPostController;
  let service: JobPostService;

  const mockJobPostService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggleSave: jest.fn(),
    getSavedJobs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPostController],
      providers: [
        {
          provide: JobPostService,
          useValue: mockJobPostService,
        },
      ],
    }).compile();

    controller = module.get<JobPostController>(JobPostController);
    service = module.get<JobPostService>(JobPostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of job posts', async () => {
      const mockJobPosts = [{ id: '1' }, { id: '2' }];
      mockJobPostService.findAll.mockResolvedValue(mockJobPosts);

      const result = await controller.findAll();

      expect(result).toEqual(mockJobPosts);
      expect(mockJobPostService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a job post', async () => {
      const mockJobPost = { id: '1' };
      mockJobPostService.findOne.mockResolvedValue(mockJobPost);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockJobPost);
      expect(mockJobPostService.findOne).toHaveBeenCalledWith('1', undefined);
    });

    it('should throw NotFoundException if job post not found', async () => {
      mockJobPostService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a job post', async () => {
      const mockJobPost = { id: '1' };
      const createJobPostDto = {
        title: 'Test Job',
        description: 'Test Description',
        paymentAmount: 100,
        deadline: new Date(Date.now() + 86400000), // Tomorrow
        category: JobPostCategory.GENERAL_CONSTRUCTION,
        location: {
          country: 'Test Country',
          city: 'Test City',
          address: 'Test Address',
          latitude: 0,
          longitude: 0,
        },
      };

      mockJobPostService.create.mockResolvedValue(mockJobPost);

      const result = await controller.create(createJobPostDto, { id: 'user-id' });

      expect(result).toEqual(mockJobPost);
      expect(mockJobPostService.create).toHaveBeenCalledWith(createJobPostDto, 'user-id');
    });

    it('should throw ForbiddenException if deadline is in the past', async () => {
      const createJobPostDto = {
        title: 'Test Job',
        description: 'Test Description',
        paymentAmount: 100,
        deadline: new Date('2020-01-01'),
        category: JobPostCategory.GENERAL_CONSTRUCTION,
        location: {
          country: 'Test Country',
          city: 'Test City',
          address: 'Test Address',
          latitude: 0,
          longitude: 0,
        },
      };

      await expect(controller.create(createJobPostDto, { id: 'user-id' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a job post', async () => {
      const mockJobPost = { id: '1', employer: { id: 'user-id' } };
      const updateJobPostDto = {
        title: 'Updated Job',
        description: 'Updated Description',
      };

      mockJobPostService.findOne.mockResolvedValue(mockJobPost);
      mockJobPostService.update.mockResolvedValue(undefined);

      await controller.update('1', updateJobPostDto, { id: 'user-id' });

      expect(mockJobPostService.findOne).toHaveBeenCalledWith('1', undefined);
      expect(mockJobPostService.update).toHaveBeenCalledWith('1', updateJobPostDto);
    });

    it('should throw ForbiddenException if user is not the employer', async () => {
      const mockJobPost = { id: '1', employer: { id: 'other-user' } };
      const updateJobPostDto = {
        title: 'Updated Job',
        description: 'Updated Description',
      };

      mockJobPostService.findOne.mockResolvedValue(mockJobPost);

      await expect(controller.update('1', updateJobPostDto, { id: 'user-id' })).rejects.toThrow(ForbiddenException);
    });
  });
});
