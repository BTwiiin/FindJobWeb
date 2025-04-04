import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

export const cacheConfig: CacheModuleOptions = {
    ttl: 60 * 60 * 1000, // 1 hour default in milliseconds
    max: 100, // maximum number of items in cache
    isGlobal: true,
    // Different TTLs for different types of data
    ttlMap: {
        // Job posts
        'GET-/job-posts': 60 * 5 * 1000, // 5 minutes in milliseconds
        'GET-/job-posts/:id': 60 * 5 * 1000, // 5 minutes in milliseconds
        'GET-/images/job-post/:id': 60 * 5 * 1000, // 5 minutes in milliseconds
        
        // User profiles
        'GET-/users/:username': 60 * 15 * 1000, // 15 minutes in milliseconds
        
        // Reviews
        'GET-/reviews/user/:userId': 60 * 30 * 1000, // 30 minutes in milliseconds
        
        // Search results
        'GET-/search': 60 * 5 * 1000, // 5 minutes in milliseconds
        
        // Applications
        'GET-/apply': 60 * 5 * 1000, // 5 minutes in milliseconds
    }
}; 