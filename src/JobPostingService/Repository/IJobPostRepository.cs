using JobPostingService.DTOs;
using JobPostingService.Entities;

namespace JobPostingService.Repository
{
    public interface IJobPostRepository
    {
        Task<List<JobPostDto>> GetAllAsync(string date);
        Task<JobPostDto> GetByIdAsync(Guid id);
        Task<JobPost> GetEntityByIdAsync(Guid id);
        void AddJobPost(JobPost jobPost);
        void DeleteJobPost(JobPost jobPost);
        Task<bool> SaveChangesAsync();
        Task<List<JobPost>> GetFinishedJobPosts();
        Task<bool> ExistsJobPost(Guid id);
        void SaveJobPost(SavedPost savedPost);
        Task<bool> IsJobPostSaved(Guid jobPostId, string username);
    }
}
