using JobPostingService.Entities;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace JobPostingService.Data
{
    public class JobPostingDbContext(DbContextOptions options) : DbContext (options)
    {

        public DbSet<JobPost> JobPosts { get; set; }
        public DbSet<SavedPost> SavedPosts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<SavedPost>()
                .HasKey(sp => new { sp.Username, sp.JobPostId });

            modelBuilder.AddInboxStateEntity();
            modelBuilder.AddOutboxMessageEntity();
            modelBuilder.AddOutboxStateEntity();
        }
    }
}
