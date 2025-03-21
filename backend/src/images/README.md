# Images Module Documentation

## Overview
The Images module handles image upload, retrieval, and deletion for job postings in the FindJobWeb application. It integrates with AWS S3 for image storage and uses pre-signed URLs for secure image access.

## Features
- Upload multiple images for job posts
- Retrieve images with secure pre-signed URLs
- Delete images with proper authorization
- Automatic file name sanitization and UUID generation
- Error handling and logging
- Integration with AWS S3

## Configuration
The module requires the following environment variables:
```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
```

## API Endpoints

### Upload Images
```typescript
POST /images/upload/:jobPostId
```
- **Description**: Upload multiple images for a job post
- **Authentication**: Required (JWT)
- **Parameters**:
  - `jobPostId`: string (URL parameter)
  - `images`: File[] (multipart/form-data)
- **Returns**: 
  ```json
  {
    "status": "success",
    "message": "Images uploaded successfully",
    "imageUrls": ["https://..."]
  }
  ```

### Get Job Post Images
```typescript
GET /images/job-post/:jobPostId
```
- **Description**: Get all images for a job post
- **Authentication**: Not required
- **Parameters**:
  - `jobPostId`: string (URL parameter)
- **Returns**: Array of pre-signed URLs

### Delete Image
```typescript
DELETE /images/job-post/:jobPostId/:imageKey
```
- **Description**: Delete an image from a job post
- **Authentication**: Required (JWT)
- **Parameters**:
  - `jobPostId`: string (URL parameter)
  - `imageKey`: string (URL parameter)
- **Returns**: Success/failure message

## Implementation Details

### Image Storage
Images are stored in AWS S3 with the following structure:
- Bucket: Configured via `AWS_BUCKET_NAME`
- Key format: `{uuid}.{extension}`
- URLs stored in database: Full S3 URLs
- Access: Pre-signed URLs with 1-hour expiration

### Security
- JWT authentication required for upload/delete operations
- Owner verification for delete operations
- Pre-signed URLs for secure image access
- File type and size validation
- Sanitized file names

### Error Handling
The service includes comprehensive error handling for:
- S3 operations (upload, delete, URL generation)
- Database operations
- Authorization checks
- File validation

## Code Examples

### Uploading Images
```typescript
// Frontend
const formData = new FormData();
files.forEach(file => formData.append('images', file));

const response = await fetch(`/api/images/upload/${jobPostId}`, {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Getting Images
```typescript
// Frontend
const response = await fetch(`/api/images/job-post/${jobPostId}`);
const imageUrls = await response.json();
```

### Deleting Images
```typescript
// Frontend
const response = await fetch(`/api/images/job-post/${jobPostId}/${imageKey}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Testing
The module includes comprehensive tests covering:
- Successful image operations
- Error cases
- Authorization checks
- S3 integration

Run tests with:
```bash
npm run test images.service
```

## Dependencies
- `@nestjs/common`: NestJS framework
- `aws-sdk`: AWS SDK for S3 operations
- `@nestjs/config`: Configuration management
- `typeorm`: Database operations

## Best Practices
1. **File Handling**:
   - Validate file types and sizes
   - Use UUIDs for unique file names
   - Sanitize file names

2. **Security**:
   - Always verify user ownership
   - Use pre-signed URLs
   - Implement proper error handling

3. **Performance**:
   - Parallel image uploads
   - Efficient database queries
   - Proper cleanup on errors

## Integration with Job Posts
The Images module is integrated with the Job Posts module through:
- Job post ID references
- Employer verification
- Cascading deletes

## Future Improvements
1. Image optimization
2. CDN integration
3. Batch operations
4. Image metadata storage
5. Cache implementation
6. Rate limiting
7. Support for image resizing
8. Improved error reporting 