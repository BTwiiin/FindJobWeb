import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(errors: any[]) {
    super({
      statusCode: 400,
      message: 'Validation failed',
      error: 'Bad Request',
      errors,
      timestamp: new Date().toISOString(),
    });
  }
} 