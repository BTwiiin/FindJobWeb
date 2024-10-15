using JobPostingService.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobPostingService.Data
{
    public class JobPostingDbContext : DbContext 
    {
        public JobPostingDbContext(DbContextOptions<JobPostingDbContext> options) : base(options)
        {
        }

        public DbSet<JobPost> JobPosts { get; set; }
    }
}
