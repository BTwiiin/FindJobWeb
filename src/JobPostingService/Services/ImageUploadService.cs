using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Transfer;

public class ImageUploadService : IImageUploadService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public ImageUploadService(IConfiguration configuration)
    {
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
    }

     public async Task<string> SaveImageAsync(IFormFile image)
    {
        if (string.IsNullOrEmpty(_bucketName))
        {
            throw new Exception("AWS bucket name is missing from configuration.");
        }

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";

        using var stream = image.OpenReadStream(); // Directly read from form file

        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = stream,
            BucketName = _bucketName,
            Key = fileName,
            ContentType = image.ContentType
        };

        var transferUtility = new TransferUtility(_s3Client);
        await transferUtility.UploadAsync(uploadRequest);

        // Get the region name from the S3 client configuration
        string region = _s3Client.Config.RegionEndpoint.SystemName;

        // Return S3 URL
        return $"https://{_bucketName}.s3.{region}.amazonaws.com/{fileName}";
    }
}