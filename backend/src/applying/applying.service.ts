import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository, In, DataSource } from 'typeorm';
import { JobApplication, ApplicationStatus } from '../entities/job-application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JobPost } from '../entities/job-post.entity';
import { User } from 'src/entities/user.entity';
import { ContactType } from 'src/entities/enums/contact-type.enum';

@Injectable()
export class ApplyingService {
  private readonly jobApplicationRepository: Repository<JobApplication>;
  private readonly jobPostRepository: Repository<JobPost>;

  constructor(
    @Inject("DATA_SOURCE")
    private dataSource: DataSource,
  ) {
    this.jobApplicationRepository = this.dataSource.getRepository(JobApplication);
    this.jobPostRepository = this.dataSource.getRepository(JobPost);
  }

  async apply(user: User, createApplicationDto: CreateApplicationDto): Promise<JobApplication> {
    const jobPost = await this.jobPostRepository.findOne({
      where: { id: createApplicationDto.jobPostId }
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    // Check if user has already applied
    const existingApplication = await this.jobApplicationRepository.findOne({
      where: {
        jobPostId: createApplicationDto.jobPostId,
        applicantId: user.id
      }
    });

    if (existingApplication) {
      throw new UnauthorizedException('You have already applied for this job');
    }

    if (!createApplicationDto.email && (createApplicationDto.contactType === ContactType.EMAIL || createApplicationDto.contactType === ContactType.BOTH)) {
      createApplicationDto.email = user.email;
    }

    if (!createApplicationDto.phone && (createApplicationDto.contactType === ContactType.PHONE || createApplicationDto.contactType === ContactType.BOTH)) {
      createApplicationDto.phone = user.phone;
    }

    const application = this.jobApplicationRepository.create({
      ...createApplicationDto,
      applicantId: user.id,
      status: ApplicationStatus.PENDING
    });

    return this.jobApplicationRepository.save(application);
  }

  async findAll(userId: string, isEmployer: boolean): Promise<JobApplication[]> {
    if (isEmployer) {
      // For employers, find all applications for their job posts
      const jobPosts = await this.jobPostRepository.find({
        where: { employer: { id: userId } }
      });
      
      return this.jobApplicationRepository.find({
        where: {
          jobPostId: In(jobPosts.map(post => post.id))
        },
        relations: ['jobPost', 'applicant']
      });
    } else {
      // For applicants, find their applications
      return this.jobApplicationRepository.find({
        where: {
          applicantId: userId
        },
        relations: ['jobPost']
      });
    }
  }

  async findOne(id: string, userId: string, isEmployer: boolean): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id },
      relations: ['jobPost', 'applicant', 'jobPost.employer']
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check if user has permission to view this application
    if (isEmployer) {
      if (application.jobPost.employer.id !== userId) {
        throw new UnauthorizedException('You do not have permission to view this application');
      }
    } else if (application.applicantId !== userId) {
      throw new UnauthorizedException('You do not have permission to view this application');
    }

    return application;
  }

  async update(id: string, userId: string, updateApplicationDto: UpdateApplicationDto): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id },
      relations: ['jobPost', 'jobPost.employer']
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Only employer can update status and notes
    if (application.jobPost.employer.id !== userId) {
      throw new UnauthorizedException('You do not have permission to update this application');
    }

    if (updateApplicationDto.status) {
      application.status = updateApplicationDto.status;
      application.reviewedAt = new Date();
    }

    if (updateApplicationDto.employerNotes) {
      application.employerNotes = updateApplicationDto.employerNotes;
    }

    return this.jobApplicationRepository.save(application);
  }

  async withdraw(id: string, userId: string): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Only applicant can withdraw their application
    if (application.applicantId !== userId) {
      throw new UnauthorizedException('You do not have permission to withdraw this application');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new UnauthorizedException('Application is already withdrawn');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    return this.jobApplicationRepository.save(application);
  }

  async archive(id: string, userId: string): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id },
      relations: ['jobPost', 'jobPost.employer']
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Both employer and applicant can archive the application
    if (application.applicantId !== userId && application.jobPost.employer.id !== userId) {
      throw new UnauthorizedException('You do not have permission to archive this application');
    }

    application.isArchived = true;
    return this.jobApplicationRepository.save(application);
  }
} 