using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Model.Internal.MarshallTransformations;
using Amazon.S3.Transfer;

public class ImageUploadService : IImageUploadService
{
    #region Configuration
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<ImageUploadService> _logger;
    private readonly TransferUtility _transferUtility;

    public ImageUploadService(IConfiguration configuration, ILogger<ImageUploadService> logger)
    {
        _logger = logger;

        var awsSettings = configuration.GetSection("AWS");
        var accessKey = awsSettings["AccessKey"];
        var secretKey = awsSettings["SecretKey"];
        var region = awsSettings["Region"];

        _bucketName = awsSettings["BucketName"];

        if (string.IsNullOrEmpty(accessKey) || string.IsNullOrEmpty(secretKey))
        {
            throw new Exception("AWS credentials are missing in appsettings.json");
        }

        var credentials = new BasicAWSCredentials(accessKey, secretKey);
        var regionEndpoint = RegionEndpoint.GetBySystemName(region);

        _s3Client = new AmazonS3Client(credentials, regionEndpoint);
        _transferUtility = new TransferUtility(_s3Client);
    }

    #endregion

    #region Delete

    public async Task<bool> DeleteImageAcync(string key)
    {
        if (string.IsNullOrEmpty(_bucketName))
        {
            throw new InvalidOperationException("AWS bucket name is missing from configuration.");
        }

        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = key
        };

        try 
        {
            var response = await _s3Client.DeleteObjectAsync(request);
            return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent || 
                response.HttpStatusCode == System.Net.HttpStatusCode.OK;
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "S3 error deleting image {PreSignedUrl}: {Message}", key, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error deleting image {PreSignedUrl}: {Message}", key, ex.Message);
        }

        return false;
    }

    #endregion

    #region GetPreSignedUrl

    public Task<string> GetPreSignedUrl(string imageUrl)
    {
        if (string.IsNullOrEmpty(_bucketName))
        {
            throw new Exception("AWS bucket name is missing from configuration.");
        }

        var key = imageUrl.Split('/').Last();
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddHours(1) // URL valid for 1 hour
        };

        try 
        {
            var preSignedUrl = _s3Client.GetPreSignedURL(request);
            return Task.FromResult(preSignedUrl);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Error generating pre-signed URL: {Message}", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating pre-signed URL: {Message}", ex.Message);
        }
        
        return Task.FromResult(string.Empty);
    }

    #endregion

    #region Save

    public async Task<string> SaveImageAsync(IFormFile image)
    {
        if (string.IsNullOrEmpty(_bucketName))
        {
            throw new Exception("AWS bucket name is missing from configuration.");
        }

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName.Replace("/", "_"))}";

        await using var stream = image.OpenReadStream(); // Directly read from form file

        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = stream,
            BucketName = _bucketName,
            Key = fileName,
            ContentType = image.ContentType
        };

        try
        {
            await _transferUtility.UploadAsync(uploadRequest);

            string region = _s3Client.Config.RegionEndpoint.SystemName;
            string fileUrl = $"https://{_bucketName}.s3.{region}.amazonaws.com/{fileName}";

            _logger.LogInformation("Image uploaded successfully: {FileUrl}", fileUrl);

            return $"https://{_bucketName}.s3.{region}.amazonaws.com/{fileName}";
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "AWS S3 error: {Message}", ex.Message);
            throw new Exception("Failed to upload image to S3.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while uploading image.");
            throw;
        }
    }

    #endregion
}