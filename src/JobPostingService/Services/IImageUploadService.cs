public interface IImageUploadService
{
    Task<string> SaveImageAsync(IFormFile image);
    Task<bool> DeleteImageAcync(string key);
    Task<string> GetPreSignedUrl(string photoUrl);
}
