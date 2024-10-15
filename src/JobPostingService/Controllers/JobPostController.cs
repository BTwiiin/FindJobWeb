using AutoMapper;
using JobPostingService.Data;
using JobPostingService.DTOs;
using JobPostingService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPostingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobPostController : Controller
    {
        private readonly JobPostingDbContext _context;
        private readonly IMapper _mapper;
        public JobPostController(JobPostingDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<JobPostDto>>> GetJobPosts()
        {
            var jobPosts = await _context.JobPosts
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
            return _mapper.Map<List<JobPostDto>>(jobPosts);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobPostDto>> GetJobPostById(Guid id)
        {
            var jobPost = await _context.JobPosts
                .FirstOrDefaultAsync(x => x.Id == id);
            if (jobPost == null) return NotFound();

            return _mapper.Map<JobPostDto>(jobPost);
        }

        [HttpPost]
        public async Task<ActionResult<JobPostDto>> CreateJobPost(CreateJobPostDto createJobPostDto)
        {
            var jobPost = _mapper.Map<JobPost>(createJobPostDto);
            // TODO: Add current user as Employer
            jobPost.Employer = "Employer";
            _context.JobPosts.Add(jobPost);
            var result = await _context.SaveChangesAsync() > 0;

            if (!result) return BadRequest("Could not save changes to the db");

            return CreatedAtAction(nameof(GetJobPostById),
                new { jobPost.Id },
                _mapper.Map<JobPostDto>(jobPost));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateJobPost(Guid id, UpdateJobPostDto updateJobPostDto)
        {
            var jobPost = await _context.JobPosts
                .FirstOrDefaultAsync(x => x.Id == id);
            if (jobPost == null) return NotFound();
            // TODO: Check employer == current user

            jobPost.Title = updateJobPostDto.Title ?? jobPost.Title;
            jobPost.Description = updateJobPostDto.Description ?? jobPost.Description;
            jobPost.PaymentAmount = updateJobPostDto.PaymentAmount ?? jobPost.PaymentAmount;
            jobPost.Deadline = updateJobPostDto.Deadline ?? jobPost.Deadline;
            if (updateJobPostDto.Category != null)
            {
                if (Enum.TryParse(updateJobPostDto.Category, out Category category))
                {
                    jobPost.Category = category;
                }
                else
                {
                    return BadRequest("Invalid category value");
                }
            }

            var result = await _context.SaveChangesAsync() > 0;
            if (result) return Ok();
            return BadRequest("Could not update data");
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteJobPost(Guid id)
        {
            var jobPost = await _context.JobPosts
                .FindAsync(id);
            if (jobPost == null) return NotFound();
            _context.JobPosts.Remove(jobPost);
            var result = await _context.SaveChangesAsync() > 0;
            if (result) return Ok();
            return BadRequest("Could not delete data");
        }
    }
}
