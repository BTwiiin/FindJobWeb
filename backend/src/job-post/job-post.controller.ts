import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards, ForbiddenException, Request, UseInterceptors } from '@nestjs/common';
import { JobPost } from '../entities/job-post.entity';
import { JobPostService } from './job-post.service';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../entities/enums/role.enum';
import { OptionalUser } from '../auth/decorators/optional-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('job-posts')
export class JobPostController {
    constructor(private readonly jobPostService: JobPostService) {}

    @Get()
    async findAll(@OptionalUser() userId?: string): Promise<JobPost[]> {
        return this.jobPostService.findAll(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('saved')
    async getSavedJobs(@CurrentUser() user: { id: string }): Promise<any[]> {
        return this.jobPostService.getSavedJobs(user.id);
    }

    @Get('my-posts')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER)
    async getMyJobPosts(@Request() req) {
        return this.jobPostService.findByEmployer(req.user.id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @OptionalUser() userId?: string): Promise<JobPost> {
        const jobPost = await this.jobPostService.findOne(id, userId);
        if (!jobPost) {
            throw new NotFoundException({
                statusCode: 404,
                message: 'Job post not found',
                error: 'Not Found'
            });
        }
        return jobPost;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER)
    @Put('archive/:id')
    async archive(@Param('id') id: string, @CurrentUser() user: { id: string }): Promise<void> {
        return this.jobPostService.archive(id, user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER)
    @Post()
    async create(@Body() createJobPostDto: CreateJobPostDto, @CurrentUser() user: { id: string }): Promise<JobPost> {
        if (createJobPostDto.deadline <= new Date()) {
            throw new ForbiddenException('The deadline must be a future date.');
        }
        return this.jobPostService.create(createJobPostDto, user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateJobPostDto: UpdateJobPostDto,
        @CurrentUser() user: { id: string }
    ): Promise<void> {
        try {
            const jobPost = await this.jobPostService.findOne(id);
            if (!jobPost) {
                throw new NotFoundException('Job post not found');
            }

            if (jobPost.employer.id !== user.id) {
                throw new ForbiddenException('You can only update your own job posts');
            }

            if (updateJobPostDto.deadline && updateJobPostDto.deadline <= new Date()) {
                throw new ForbiddenException('The deadline must be a future date.');
            }

            await this.jobPostService.update(id, updateJobPostDto);
        } catch (error) {
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EMPLOYER)
    @Delete(':id')
    async delete(@Param('id') id: string, @CurrentUser() user: { id: string }): Promise<void> {
        const jobPost = await this.jobPostService.findOne(id);
        if (!jobPost) {
            throw new NotFoundException('Job post not found');
        }

        if (jobPost.employer.id !== user.id) {
            throw new ForbiddenException('You can only delete your own job posts');
        }

        await this.jobPostService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('save/:id')
    async saveJobPost(@Param('id') id: string, @CurrentUser() user: { id: string }): Promise<void> {
        const jobPost = await this.jobPostService.findOne(id);
        if (!jobPost) {
            throw new NotFoundException('Job post not found');
        }

        await this.jobPostService.toggleSave(id, user.id);
    }
}
