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
    }
}
