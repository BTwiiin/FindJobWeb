using System.ComponentModel.DataAnnotations.Schema;
using AutoMapper;
using Contracts;
using JobPostingService.DTOs;
using JobPostingService.Entities;
using JobPostingService.Repository;
using MassTransit;
using MassTransit.Testing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPostingService.Controllers;


[ApiController]
[Route("api/[controller]")]
public class JobPostController : Controller
{
    private readonly IJobPostRepository _jobPostRepository;
    private readonly IMapper _mapper;
    private readonly IPublishEndpoint _publishEndpoint;

    public JobPostController(IJobPostRepository jobPostRepository, IMapper mapper, IPublishEndpoint publishEndpoint)
    {
        _jobPostRepository = jobPostRepository;
        _mapper = mapper;
        _publishEndpoint = publishEndpoint;
    }

    [HttpGet]
    public async Task<ActionResult<List<JobPostDto>>> GetJobPosts(string date)
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

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<JobPostDto>> CreateJobPost(CreateJobPostDto createJobPostDto)
    {
        var jobPost = _mapper.Map<JobPost>(createJobPostDto);

        jobPost.Employer = User.Identity.Name;

        _jobPostRepository.AddJobPost(jobPost);

        var newJobPost = _mapper.Map<JobPostDto>(jobPost);

        await _publishEndpoint.Publish(_mapper.Map<JobPostCreated>(newJobPost));

        var result = await _jobPostRepository.SaveChangesAsync();

        if (!result) return BadRequest("Could not save changes to the db");

        return CreatedAtAction(nameof(GetJobPostById),
            new { jobPost.Id },
            newJobPost);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateJobPost(Guid id, UpdateJobPostDto updateJobPostDto)
    {
        var jobPost = await _jobPostRepository.GetEntityByIdAsync(id);
        if (jobPost == null) return NotFound();

        if(jobPost.Employer != User.Identity?.Name) return Forbid();

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

        await _publishEndpoint.Publish(_mapper.Map<JobPostUpdated>(jobPost));

        var result = await _jobPostRepository.SaveChangesAsync();
        if (result) return Ok();
        return BadRequest("Could not update data");
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteJobPost(Guid id)
    {
        var jobPost = await _jobPostRepository.GetEntityByIdAsync(id);
        if (jobPost == null) return NotFound();

        if (jobPost.Employer != User.Identity.Name) return Forbid();

        _jobPostRepository.DeleteJobPost(jobPost);

        await _publishEndpoint.Publish<JobPostDeleted>(new { Id = jobPost.Id.ToString() });

        var result = await _jobPostRepository.SaveChangesAsync();

        if (result) return Ok();
        return BadRequest("Could not delete data");
    }
}
