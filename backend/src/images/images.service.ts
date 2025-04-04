import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { JobPost } from '../entities/job-post.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ImagesService {
  private s3Client: S3;
  private bucketName: string;
  private region: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
  ) {
    this.region = this.configService.get('AWS_REGION') || '';
    this.s3Client = new S3({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
      signatureVersion: 'v4',
    });
    this.bucketName = this.configService.get('AWS_BUCKET_NAME') || '';
  }

  private async getSignedUrl(key: string): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: 3600, // 1 hour, matching .NET implementation
      };
      return await this.s3Client.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      return '';
    }
  }

  private getKeyFromUrl(url: string): string {
    try {
      // Remove query parameters
      const baseUrl = url.split('?')[0];
      
      // Extract the key (everything after the bucket name)
      const bucketUrlPrefix = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/`;
      if (baseUrl.startsWith(bucketUrlPrefix)) {
        return decodeURIComponent(baseUrl.substring(bucketUrlPrefix.length));
      }
      
      // If it's already just a key, return it
      return url;
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return url;
    }
  }

  async uploadImages(files: Express.Multer.File[], jobPostId: string): Promise<string[]> {
    const jobPost = await this.jobPostRepository.findOne({ where: { id: jobPostId } });
    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    if (!jobPost.photoUrls) {
      jobPost.photoUrls = [];
    }

    const uploadPromises = files.map(async (file) => {
      // Generate a unique filename using UUID, matching .NET implementation
      const fileExtension = file.originalname.split('.').pop() || 'jpg'; // Default to jpg if no extension
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      
      try {
        await this.s3Client.upload({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }).promise();

        // Store the full S3 URL in the database, matching .NET implementation
        const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
        jobPost.photoUrls.push(fileUrl);
        
        return fileUrl;
      } catch (error) {
        console.error('AWS S3 error:', error);
        throw new Error('Failed to upload image to S3.');
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      await this.jobPostRepository.save(jobPost);
      
      // Return pre-signed URLs for immediate use
      return await Promise.all(uploadedUrls.map(url => {
        const key = this.getKeyFromUrl(url);
        return this.getSignedUrl(key);
      }));
    } catch (error) {
      console.error('Error during upload process:', error);
      throw new Error('Failed to process image uploads.');
    }
  }

  async getJobPostImages(jobPostId: string): Promise<string[]> {
    const jobPost = await this.jobPostRepository.findOne({ where: { id: jobPostId } });
    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    if (!jobPost.photoUrls || jobPost.photoUrls.length === 0) {
      return [];
    }

    // Generate pre-signed URLs for all images, matching .NET implementation
    return await Promise.all(
      jobPost.photoUrls.map(url => this.getSignedUrl(this.getKeyFromUrl(url)))
    );
  }

  async deleteImage(jobPostId: string, imageKey: string, userId: string): Promise<boolean> {
    const jobPost = await this.jobPostRepository.findOne({ 
      where: { id: jobPostId },
      relations: ['employer']
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    if (jobPost.employer.id !== userId) {
      throw new ForbiddenException('You can only delete images from your own job posts');
    }

    try {
      const key = this.getKeyFromUrl(imageKey);
      await this.s3Client.deleteObject({
        Bucket: this.bucketName,
        Key: key,
      }).promise();

      // Update photoUrls array by removing the matching URL
      const urlToRemove = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      jobPost.photoUrls = jobPost.photoUrls.filter(url => {
        const urlKey = this.getKeyFromUrl(url);
        return urlKey !== key;
      });
      await this.jobPostRepository.save(jobPost);

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
} 