import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from './common/services/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    try {
      return this.appService.getHello();
    } catch (error) {
      this.logger.error('Error in getHello:', error);
      throw new InternalServerErrorException('Failed to get hello message');
    }
  }
}
