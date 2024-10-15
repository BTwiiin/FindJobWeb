using JobPostingService.Entities;

namespace JobPostingService.Repository
{
    public interface IJobPostRepository
    {
        Task<IEnumerable<JobPost>> GetAllAsync();
        Task<JobPost> GetByIdAsync(Guid id);
        Task AddAsync(JobPost jobPost);
        Task DeleteAsync(JobPost jobPost);
        Task<bool> SaveChangesAsync();
    }
}
