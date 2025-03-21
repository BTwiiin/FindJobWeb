import { Test, TestingModule } from '@nestjs/testing';
import { JobPostService } from './job-post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobPost } from '../entities/job-post.entity';
import { SavedPost } from '../entities/saved-post.entity';
import { Location } from '../entities/location.entity';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { JobPostCategory } from '../entities/enums/job-post-category.enum';

describe('JobPostService', () => {
  let service: JobPostService;
  let jobPostRepository: Repository<JobPost>;
  let savedPostRepository: Repository<SavedPost>;
  let locationRepository: Repository<Location>;
  let userRepository: Repository<User>;

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
      },
    })),
    getRepository: jest.fn((entity) => {
      switch (entity) {
        case JobPost:
          return mockJobPostRepository;
        case SavedPost:
          return mockSavedPostRepository;
        case Location:
          return mockLocationRepository;
        case User:
          return mockUserRepository;
        default:
          return {};
      }
    }),
  };

  const mockJobPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  const mockSavedPostRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockLocationRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostService,
        {
          provide: 'DATA_SOURCE',
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<JobPostService>(JobPostService);
    jobPostRepository = mockDataSource.getRepository(JobPost) as Repository<JobPost>;
    savedPostRepository = mockDataSource.getRepository(SavedPost) as Repository<SavedPost>;
    locationRepository = mockDataSource.getRepository(Location) as Repository<Location>;
    userRepository = mockDataSource.getRepository(User) as Repository<User>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job post successfully', async () => {
      const mockUser = { id: 'user-id', username: 'testuser' };
      const mockLocation = { id: 'location-id' };
      const mockJobPost = { 
        id: 'job-post-id',
        title: 'Test Job',
        description: 'Test Description',
        paymentAmount: 100,
        deadline: new Date(),
        category: JobPostCategory.GENERAL_CONSTRUCTION,
        employer: mockUser,
        location: mockLocation
      };

      // Mock user repository
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      
      // Mock location repository
      mockLocationRepository.findOne.mockResolvedValue(null);
      mockLocationRepository.create.mockReturnValue(mockLocation);
      mockLocationRepository.save.mockResolvedValue(mockLocation);
      
      // Mock job post repository
      mockJobPostRepository.create.mockReturnValue(mockJobPost);
      mockJobPostRepository.save.mockResolvedValue(mockJobPost);

      // Mock the query builder chain for getting job post with relations
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockJobPost)
      };
      mockJobPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const createJobPostDto = {
        title: 'Test Job',
        description: 'Test Description',
        paymentAmount: 100,
        deadline: new Date(),
        category: JobPostCategory.GENERAL_CONSTRUCTION,
        location: {
          country: 'Test Country',
          city: 'Test City',
          address: 'Test Address',
          latitude: 0,
          longitude: 0,
        },
      };

      const result = await service.create(createJobPostDto, 'user-id');

      expect(result).toBeDefined();
      expect(result).toEqual(mockJobPost);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(mockLocationRepository.findOne).toHaveBeenCalled();
      expect(mockLocationRepository.create).toHaveBeenCalled();
      expect(mockLocationRepository.save).toHaveBeenCalled();
      expect(mockJobPostRepository.create).toHaveBeenCalled();
      expect(mockJobPostRepository.save).toHaveBeenCalled();
      expect(mockJobPostRepository.createQueryBuilder).toHaveBeenCalledWith('jobPost');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('jobPost.employer', 'employer');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('jobPost.location', 'location');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('jobPost.id = :id', { id: 'job-post-id' });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const createJobPostDto = {
        title: 'Test Job',
        description: 'Test Description',
        paymentAmount: 100,
        deadline: new Date(),
        category: JobPostCategory.GENERAL_CONSTRUCTION,
        location: {
          country: 'Test Country',
          city: 'Test City',
          address: 'Test Address',
          latitude: 0,
          longitude: 0,
        },
      };

      await expect(service.create(createJobPostDto, 'non-existent-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleSave', () => {
    it('should save a job post if not already saved', async () => {
      mockSavedPostRepository.findOne.mockResolvedValue(null);
      mockSavedPostRepository.save.mockResolvedValue({});

      await service.toggleSave('job-post-id', 'user-id');

      expect(mockSavedPostRepository.findOne).toHaveBeenCalled();
      expect(mockSavedPostRepository.save).toHaveBeenCalledWith({
        jobPost: { id: 'job-post-id' },
        user: { id: 'user-id' },
      });
    });

    it('should remove a saved job post if already saved', async () => {
      const mockSavedPost = { id: 'saved-post-id' };
      mockSavedPostRepository.findOne.mockResolvedValue(mockSavedPost);
      mockSavedPostRepository.remove.mockResolvedValue({});

      await service.toggleSave('job-post-id', 'user-id');

      expect(mockSavedPostRepository.findOne).toHaveBeenCalled();
      expect(mockSavedPostRepository.remove).toHaveBeenCalledWith(mockSavedPost);
    });
  });
}); 