public interface IImageUploadService
{
    Task<string> SaveImageAsync(IFormFile image);
}
