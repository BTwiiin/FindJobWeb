public interface IImageUploadService
{
    Task<string> SaveImageAsync(IFormFile image);
    Task<string> GetPreSignedUrl(string photoUrl);
}
