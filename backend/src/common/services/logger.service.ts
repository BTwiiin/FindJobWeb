import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  log(message: string, ...args: any[]) {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, ...args);
  }

  error(message: string, trace?: string, ...args: any[]) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, trace, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, ...args);
    }
  }

  verbose(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[${new Date().toISOString()}] VERBOSE: ${message}`, ...args);
    }
  }
} 