using JobPostingService.Data;
using JobPostingService.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobPostingService.Repository
{
    public class JobPostRepository : IJobPostRepository
    {
        private readonly JobPostingDbContext _context;
        public JobPostRepository(JobPostingDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<JobPost>> GetAllAsync()
        {
            return await _context.JobPosts
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }
        public async Task<JobPost> GetByIdAsync(Guid id)
        {
            return await _context.JobPosts
                .FirstOrDefaultAsync(x => x.Id == id);
        }
        public async Task AddAsync(JobPost jobPost)
        {
            await _context.JobPosts.AddAsync(jobPost);
        }
        public async Task DeleteAsync(JobPost jobPost)
        {
            _context.JobPosts.Remove(jobPost);
        }
        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
