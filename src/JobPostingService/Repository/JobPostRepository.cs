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
        public async Task<List<JobPostDto>> GetAllAsync(string? date)
        {
            var query = _context.JobPosts.OrderBy(x => x.CreatedAt).AsQueryable();

            if (!string.IsNullOrEmpty(date))
            {
                query = query.Where(x => x.UpdatedAt.CompareTo(DateTime.Parse(date).ToUniversalTime()) > 0);
            }

            return await query.ProjectTo<JobPostDto>(_mapper.ConfigurationProvider).ToListAsync();
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
