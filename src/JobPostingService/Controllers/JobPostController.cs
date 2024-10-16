using AutoMapper;
using JobPostingService.DTOs;
using JobPostingService.Entities;
using JobPostingService.Repository;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class JobPostController : Controller
{
    private readonly IJobPostRepository _jobPostRepository;
    private readonly IMapper _mapper;

    public JobPostController(IJobPostRepository jobPostRepository, IMapper mapper)
    {
        _jobPostRepository = jobPostRepository;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<JobPostDto>>> GetJobPosts(string? date)
    {
        return await _jobPostRepository.GetAllAsync(date);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobPostDto>> GetJobPostById(Guid id)
    {
        var jobPost = await _jobPostRepository.GetByIdAsync(id);
        if (jobPost == null) return NotFound();

        return _mapper.Map<JobPostDto>(jobPost);
    }

    [HttpPost]
    public async Task<ActionResult<JobPostDto>> CreateJobPost(CreateJobPostDto createJobPostDto)
    {
        var jobPost = _mapper.Map<JobPost>(createJobPostDto);
        jobPost.Employer = "Employer"; // TODO: Add current user as Employer

        await _jobPostRepository.AddAsync(jobPost);
        var result = await _jobPostRepository.SaveChangesAsync();

        if (!result) return BadRequest("Could not save changes to the db");

        return CreatedAtAction(nameof(GetJobPostById),
            new { jobPost.Id },
            _mapper.Map<JobPostDto>(jobPost));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateJobPost(Guid id, UpdateJobPostDto updateJobPostDto)
    {
        var jobPost = await _jobPostRepository.GetByIdAsync(id);
        if (jobPost == null) return NotFound();

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

        var result = await _jobPostRepository.SaveChangesAsync();
        if (result) return Ok();
        return BadRequest("Could not update data");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteJobPost(Guid id)
    {
        var jobPost = await _jobPostRepository.GetByIdAsync(id);
        if (jobPost == null) return NotFound();

        await _jobPostRepository.DeleteAsync(jobPost);
        var result = await _jobPostRepository.SaveChangesAsync();

        if (result) return Ok();
        return BadRequest("Could not delete data");
    }
}
