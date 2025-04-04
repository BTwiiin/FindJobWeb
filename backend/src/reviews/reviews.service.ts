import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { JobApplication, ApplicationStatus } from '../entities/job-application.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(JobApplication)
    private jobApplicationRepository: Repository<JobApplication>,
  ) {}

  async createReview(
    jobApplicationId: string,
    rating: number,
    comment: string,
    reviewerId: string,
  ): Promise<Review> {
    const jobApplication = await this.jobApplicationRepository.findOne({
      where: { id: jobApplicationId },
      relations: ['applicant', 'jobPost', 'jobPost.employer'],
    });

    if (!jobApplication) {
      throw new Error('Job application not found');
    }

    // Determine who is reviewing whom
    const isApplicantReviewing = reviewerId === jobApplication.applicant.id;
    const reviewer = isApplicantReviewing ? jobApplication.applicant : jobApplication.jobPost.employer;
    const reviewedUser = isApplicantReviewing ? jobApplication.jobPost.employer : jobApplication.applicant;

    const review = this.reviewRepository.create({
      jobApplicationId: jobApplication.id,
      rating,
      comment,
      reviewer,
      reviewedUser,
    });

    return this.reviewRepository.save(review);
  }

  async getReview(jobApplicationId: string): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { jobApplicationId },
    });
  }

  async getAlreadyReviewed(userId: string): Promise<Array<string>> {
    const reviews = await this.reviewRepository.find({
      where: { reviewer: { id: userId } },
    });
    return reviews.map(review => review.jobApplicationId);
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: [
        { reviewedUser: { id: userId } },
      ],
      relations: ['reviewer', 'reviewedUser'],
    });
  }

  async markJobAsCompleted(jobApplicationId: string): Promise<JobApplication> {
    const jobApplication = await this.jobApplicationRepository.findOne({
      where: { id: jobApplicationId },
    });

    if (!jobApplication) {
      throw new Error('Job application not found');
    }

    jobApplication.status = ApplicationStatus.COMPLETED;
    return this.jobApplicationRepository.save(jobApplication);
  }
} 