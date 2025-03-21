import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { JobPost } from '../entities/job-post.entity';
import { Repository, DataSource } from 'typeorm';
import { SavedPost } from '../entities/saved-post.entity';
import { Location } from '../entities/location.entity';
import { User } from '../entities/user.entity';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';

@Injectable()
export class JobPostService {
    private jobPostRepository: Repository<JobPost>;
    private savedPostRepository: Repository<SavedPost>;
    private locationRepository: Repository<Location>;
    private userRepository: Repository<User>;

    constructor(
        @Inject('DATA_SOURCE')
        private dataSource: DataSource,
    ) {
        this.jobPostRepository = this.dataSource.getRepository(JobPost);
        this.savedPostRepository = this.dataSource.getRepository(SavedPost);
        this.locationRepository = this.dataSource.getRepository(Location);
        this.userRepository = this.dataSource.getRepository(User);
    }

    async findAll(userId?: string): Promise<JobPost[]> {
        const query = this.jobPostRepository.createQueryBuilder('jobPost')
            .leftJoinAndSelect('jobPost.employer', 'employer')
            .leftJoinAndSelect('jobPost.employee', 'employee')
            .leftJoinAndSelect('jobPost.location', 'location')
            .select([
                'jobPost',
                'location',
                'employer.id',
                'employer.username'
            ]);

        if (userId) {
            query.leftJoinAndSelect('jobPost.savedPosts', 'savedPost', 'savedPost.userId = :userId', { userId });
        }

        return query.getMany();
    }

    async findOne(id: string, userId?: string): Promise<JobPost | null> {
        const query = this.jobPostRepository.createQueryBuilder('jobPost')
            .innerJoinAndSelect('jobPost.employer', 'employer')
            .leftJoinAndSelect('jobPost.employee', 'employee')
            .leftJoinAndSelect('jobPost.location', 'location')
            .select([
                'jobPost',
                'location',
                'employer.id',
                'employer.username'
            ])
            .where('jobPost.id = :id', { id });

        if (userId) {
            query.leftJoinAndSelect('jobPost.savedPosts', 'savedPost', 'savedPost.userId = :userId', { userId });
        }

        return query.getOne();
    }
    
    async create(createJobPostDto: CreateJobPostDto, userId: string): Promise<JobPost> {
        // Verify user exists
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Create or find location
        let location = await this.locationRepository.findOne({
            where: {
                country: createJobPostDto.location.country,
                city: createJobPostDto.location.city,
                address: createJobPostDto.location.address,
                latitude: createJobPostDto.location.latitude,
                longitude: createJobPostDto.location.longitude
            }
        });

        if (!location) {
            location = this.locationRepository.create({
                country: createJobPostDto.location.country,
                city: createJobPostDto.location.city,
                address: createJobPostDto.location.address,
                latitude: createJobPostDto.location.latitude,
                longitude: createJobPostDto.location.longitude,
                state: createJobPostDto.location.state,
                postalCode: createJobPostDto.location.postalCode,
                formattedAddress: createJobPostDto.location.formattedAddress
            });
            location = await this.locationRepository.save(location);
        }

        // Create job post with location
        const jobPost = this.jobPostRepository.create({
            title: createJobPostDto.title,
            description: createJobPostDto.description,
            paymentAmount: createJobPostDto.paymentAmount,
            deadline: createJobPostDto.deadline,
            category: createJobPostDto.category,
            employer: user,
            location: location
        });

        const savedJobPost = await this.jobPostRepository.save(jobPost);
        
        // Return the job post with all relations loaded using QueryBuilder
        const jobPostWithRelations = await this.jobPostRepository.createQueryBuilder('jobPost')
            .innerJoinAndSelect('jobPost.employer', 'employer')
            .leftJoinAndSelect('jobPost.location', 'location')
            .select([
                'jobPost',
                'location',
                'employer.username',
                'employer.id'
            ])
            .where('jobPost.id = :id', { id: savedJobPost.id })
            .getOne();

        if (!jobPostWithRelations) {
            throw new Error('Failed to create job post');
        }

        return jobPostWithRelations;
    }

    async update(id: string, updateJobPostDto: UpdateJobPostDto): Promise<void> {
        try {
            if (updateJobPostDto.location) {
                let location = await this.locationRepository.findOne({
                    where: {
                        country: updateJobPostDto.location.country,
                        city: updateJobPostDto.location.city,
                        address: updateJobPostDto.location.address,
                        latitude: updateJobPostDto.location.latitude,
                        longitude: updateJobPostDto.location.longitude
                    }
                });

                if (!location) {
                    location = this.locationRepository.create({
                        country: updateJobPostDto.location.country,
                        city: updateJobPostDto.location.city,
                        address: updateJobPostDto.location.address,
                        latitude: updateJobPostDto.location.latitude,
                        longitude: updateJobPostDto.location.longitude,
                        state: updateJobPostDto.location.state,
                        postalCode: updateJobPostDto.location.postalCode,
                        formattedAddress: updateJobPostDto.location.formattedAddress
                    });
                    location = await this.locationRepository.save(location);
                    console.log('Created new location:', location);
                }

                updateJobPostDto.location = location;
            }

            await this.jobPostRepository.update(id, updateJobPostDto);
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        await this.jobPostRepository.delete(id);
    }

    async toggleSave(jobPostId: string, userId: string): Promise<void> {
        const existingSave = await this.savedPostRepository.findOne({
            where: {
                jobPost: { id: jobPostId },
                user: { id: userId }
            }
        });

        if (existingSave) {
            await this.savedPostRepository.remove(existingSave);
        } else {
            await this.savedPostRepository.save({
                jobPost: { id: jobPostId },
                user: { id: userId }
            });
        }
    }

    async getSavedJobs(userId: string): Promise<JobPost[]> {
        return this.jobPostRepository.createQueryBuilder('jobPost')
            .innerJoinAndSelect('jobPost.savedPosts', 'savedPost')
            .leftJoinAndSelect('jobPost.employer', 'employer')
            .leftJoinAndSelect('jobPost.employee', 'employee')
            .leftJoinAndSelect('jobPost.location', 'location')
            .select([
                'jobPost',
                'location',
                'employer.username'
            ])
            .where('savedPost.user.id = :userId', { userId })
            .getMany();
    }
} 