# FindJobWeb Backend

## Overview
FindJobWeb is a job posting platform built with NestJS, TypeORM, and AWS services. It provides a robust API for managing job posts, user authentication, and image handling.

## Project Structure
```
backend/src/
├── auth/           # Authentication module (JWT, Guards)
├── common/         # Shared utilities and middleware
├── config/         # Configuration management
├── entities/       # TypeORM entities
├── images/         # Image handling module (AWS S3)
├── job-post/       # Job posting module
├── logger/         # Custom logging implementation
├── users/          # User management module
└── app.module.ts   # Main application module
```

## Features
- User authentication with JWT
- Job post CRUD operations
- Image upload and management with AWS S3
- Role-based access control
- Error handling and logging
- Database integration with TypeORM
- Environment-based configuration

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- PostgreSQL
- AWS Account (for S3)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run migration:run

# Start the development server
npm run start:dev
```

### Environment Variables
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=findjobweb

# AWS
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
```

## API Documentation

### Authentication
- `POST /auth/login`: User login
- `POST /auth/register`: User registration
- `GET /auth/profile`: Get user profile

### Job Posts
- `GET /job-post`: Get all job posts
- `GET /job-post/:id`: Get job post by ID
- `POST /job-post`: Create job post
- `PUT /job-post/:id`: Update job post
- `DELETE /job-post/:id`: Delete job post

### Images
- `POST /images/upload/:jobPostId`: Upload images
- `GET /images/job-post/:jobPostId`: Get job post images
- `DELETE /images/job-post/:jobPostId/:imageKey`: Delete image

### Users
- `GET /users`: Get all users (admin only)
- `GET /users/:id`: Get user by ID
- `PUT /users/:id`: Update user
- `DELETE /users/:id`: Delete user

## Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development

### Code Style
- Follow NestJS best practices
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main

## Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Support
```bash
# Build Docker image
docker build -t findjobweb-backend .

# Run container
docker run -p 3000:3000 findjobweb-backend
```

## Architecture

### Database Schema
- Users
- JobPosts
- Employers
- SavedPosts
- Images (references in JobPosts)

### Authentication Flow
1. User registers/logs in
2. JWT token issued
3. Token used for protected routes
4. Token refresh mechanism

### Image Handling
- AWS S3 for storage
- Pre-signed URLs for access
- Automatic cleanup
- Size and type validation

## Error Handling
- Global exception filter
- Custom error responses
- Validation pipe
- Logging service

## Security
- JWT authentication
- Role-based access
- Request validation
- Rate limiting
- CORS configuration
- Secure headers

## Performance
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- Load balancing ready

## Monitoring and Logging
The application includes a comprehensive monitoring and logging system:

### Logging
- Winston logger integration for structured logs
- Log levels (debug, info, warn, error)
- Log rotation with daily files
- JSON logging format in production
- Context-based logging for easier debugging
- Log enrichment with request details
- Console output in development with pretty formatting

### Monitoring
- Health check endpoint at `/monitoring/health`
- Prometheus metrics at `/monitoring/metrics`
- Key metrics:
  - HTTP request counts and latencies
  - Database operation counts and durations
  - Memory and CPU usage
  - Business metrics (active users, job posts)
- Database performance tracking with TypeORM subscribers
- Slow query detection and logging
- Ready for integration with Grafana for visualization

### Setup
For development, logs are output to the console. In production, logs are also written to files in the `logs` directory:
- `combined-%DATE%.log`: All logs
- `error-%DATE%.log`: Error logs only

Logs are automatically rotated daily and compressed for better storage management.

### Custom Metrics
You can add custom business metrics by injecting the `PrometheusService`:

```typescript
// Example: Track a custom business metric
@Injectable()
export class JobPostService {
  constructor(
    private readonly prometheusService: PrometheusService,
  ) {}

  async getTrendingJobPosts() {
    // Your business logic...
    
    // Update business metrics
    this.prometheusService.updateBusinessMetrics(
      activeUsersCount, 
      totalJobPostsCount
    );
    
    // Return data...
  }
}
```

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License
[Your License]

## Support
[Contact Information]

## Authors
[Your Team]

## Acknowledgments
- NestJS team
- AWS SDK team
- TypeORM contributors
