import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('job/:jobApplicationId')
  async createReview(
    @Param('jobApplicationId') jobApplicationId: string,
    @Body() reviewData: { rating: number; comment: string },
    @Request() req,
  ) {
    return this.reviewsService.createReview(
      jobApplicationId,
      reviewData.rating,
      reviewData.comment,
      req.user.id,
    );
  }

  @Get('job/:jobApplicationId')
  async getReview(@Param('jobApplicationId') jobApplicationId: string) {
    return this.reviewsService.getReview(jobApplicationId);
  }

  @Get('already-reviewed')
  async getAlreadyReviewed(@Request() req): Promise<Array<string>> {
    return this.reviewsService.getAlreadyReviewed(req.user.id);
  }

  @Get('user/:userId')
  async getReviewsByUser(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsByUser(userId);
  }

  @Post('job/:jobApplicationId/complete')
  async markJobAsCompleted(@Param('jobApplicationId') jobApplicationId: string) {
    return this.reviewsService.markJobAsCompleted(jobApplicationId);
  }
} 