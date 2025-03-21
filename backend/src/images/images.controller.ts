import { Controller, Post, Get, Delete, Param, UseGuards, UseInterceptors, UploadedFiles, ForbiddenException, Request } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ImagesService } from './images.service';
import { Role } from '../entities/enums/role.enum';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Post('upload/:jobPostId')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImages(
    @Param('jobPostId') jobPostId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new ForbiddenException('No images provided');
    }

    const imageUrls = await this.imagesService.uploadImages(files, jobPostId);
    return { status: 'success', message: 'Images uploaded successfully', imageUrls };
  }

  @Get('job-post/:jobPostId')
  async getJobPostImages(@Param('jobPostId') jobPostId: string) {
    const imageUrls = await this.imagesService.getJobPostImages(jobPostId);
    return imageUrls;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Delete('job-post/:imageKey/:jobPostId')
  async deleteImage(
    @Request() req,
    @Param('imageKey') imageKey: string,
    @Param('jobPostId') jobPostId: string,
  ) {
    const result = await this.imagesService.deleteImage(jobPostId, imageKey, req.user.id);
    if (result) {
      return { message: 'Image deleted successfully' };
    }
    throw new ForbiddenException('Failed to delete image');
  }
} 