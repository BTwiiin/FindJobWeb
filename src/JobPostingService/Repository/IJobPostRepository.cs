using JobPostingService.DTOs;
using JobPostingService.Entities;

namespace JobPostingService.Repository
{
    public interface IJobPostRepository
    {
        Task<List<JobPostDto>> GetAllAsync(string date);
        Task<JobPost> GetByIdAsync(Guid id);
        Task AddAsync(JobPost jobPost);
        Task DeleteAsync(JobPost jobPost);
        Task<bool> SaveChangesAsync();
    }
}
