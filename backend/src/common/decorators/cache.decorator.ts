import { ExecutionContext, Injectable, Logger, CallHandler } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Request } from 'express';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
    private readonly logger = new Logger(CustomCacheInterceptor.name);

    trackBy(context: ExecutionContext): string | undefined {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url } = request;

        // Only cache GET requests
        if (method !== 'GET') {
            this.logger.log(`Skipping cache for non-GET request: ${method} ${url}`);
            return undefined;
        }

        // Don't cache certain endpoints
        if (url.includes('/auth') || url.includes('/users/me')) {
            this.logger.log(`Skipping cache for sensitive endpoint: ${url}`);
            return undefined;
        }

        // Generate cache key based on URL and query parameters
        const cacheKey = `${method}-${url}`;
        this.logger.log(`Cache key generated: ${cacheKey}`);
        return cacheKey;
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url } = request;
        const cacheKey = this.trackBy(context);

        if (!cacheKey) {
            return next.handle();
        }

        try {
            const cachedData = await this.cacheManager.get(cacheKey);
            
            if (cachedData) {
                this.logger.log(`Cache HIT for ${cacheKey}`);
                return of(cachedData);
            }

            this.logger.log(`Cache MISS for ${cacheKey}`);
            
            return next.handle().pipe(
                tap(async (response) => {
                    await this.cacheManager.set(cacheKey, response, { ttl: 60 * 5 * 1000 });
                    this.logger.log(`Data cached for ${cacheKey}`);
                })
            );
        } catch (error) {
            this.logger.error(`Cache error for ${cacheKey}: ${error.message}`);
            return next.handle();
        }
    }
}