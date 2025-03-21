import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  constructor() {
    super();
  }

  log(message: string, trace?: string) {
    super.log(message, trace);
  }

  error(message: string, trace?: string) {
    super.error(message, trace);
  }

  warn(message: string, trace?: string) {
    super.warn(message, trace);
  }

  debug(message: string, trace?: string) {
    super.debug(message, trace);
  }
} 