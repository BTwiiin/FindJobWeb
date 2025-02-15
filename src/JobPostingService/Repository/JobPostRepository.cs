using AutoMapper;
using AutoMapper.QueryableExtensions;
using JobPostingService.Data;
using JobPostingService.DTOs;
using JobPostingService.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobPostingService.Repository
{
    public class JobPostRepository : IJobPostRepository
    {
        private readonly JobPostingDbContext _context;
        private readonly IMapper _mapper;
        public JobPostRepository(JobPostingDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<JobPostDto>> GetAllAsync(string date)
        {
            var query = _context.JobPosts
                .Include(x => x.Location)
                .OrderBy(x => x.CreatedAt)
                .AsQueryable();

            if (!string.IsNullOrEmpty(date))
            {
                query = query.Where(x => x.UpdatedAt.CompareTo(DateTime.Parse(date).ToUniversalTime()) > 0);
            }

            return await query.ProjectTo<JobPostDto>(_mapper.ConfigurationProvider).ToListAsync();
        }

        public async Task<JobPostDto> GetByIdAsync(Guid id)
        {
            return await _context.JobPosts
                .Include(x => x.Location)
                .ProjectTo<JobPostDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<JobPost> GetEntityByIdAsync(Guid id)
        {
            return await _context.JobPosts
                .Include(x => x.Location)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public void AddJobPost(JobPost jobPost)
        {
            _context.JobPosts.Add(jobPost);
        }

        public void Update(JobPost jobPost)
        {
            _context.Entry(jobPost).State = EntityState.Modified;
        }

        public void DeleteJobPost(JobPost jobPost)
        {
            _context.JobPosts.Remove(jobPost);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<JobPost>> GetFinishedJobPosts()
        {
            return await _context.JobPosts.Include(x => x.Location)
                .Where(x => x.Deadline.CompareTo(DateTime.UtcNow) < 0 && x.Status != Status.Completed)
                .ToListAsync();
        }

        public async Task<bool> ExistsJobPost(Guid id)
        {
            return await _context.JobPosts.AnyAsync(x => x.Id == id);
        }

        public void SaveJobPost(SavedPost savedPost)
        {
            _context.SavedPosts.Add(savedPost);
        }

        public async Task<bool> IsJobPostSaved(Guid jobPostId, string username)
        {
            return await _context.SavedPosts.AnyAsync(x => x.JobPostId == jobPostId && x.Username == username);
        }

        public async Task<List<SavedPost>> GetSavedPosts(string username)
        {
            return await _context.SavedPosts.Where(x => x.Username == username).ToListAsync();
        }

        public void DeleteSavedPost(SavedPost savedPost)
        {
            _context.SavedPosts.Remove(savedPost);
        }

        public void RemoveAllSavedPostsByJobPostId(Guid jobPostId)
        {
            var savedPosts = _context.SavedPosts.Where(post => post.JobPostId == jobPostId).ToList();
            _context.SavedPosts.RemoveRange(savedPosts);
            Console.WriteLine($"Deleting {savedPosts.Count} SavedPosts for JobPostId: {jobPostId}");
        }
    }
}
