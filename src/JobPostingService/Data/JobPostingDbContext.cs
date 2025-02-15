using System.Text.Json;
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

            modelBuilder.Entity<JobPost>()
                .Property(j => j.PhotoUrls)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null) ?? new List<string>()
                );

            modelBuilder.Entity<SavedPost>()
                .HasKey(sp => new { sp.Username, sp.JobPostId });

            modelBuilder.AddInboxStateEntity();
            modelBuilder.AddOutboxMessageEntity();
            modelBuilder.AddOutboxStateEntity();
        }
    }
}
