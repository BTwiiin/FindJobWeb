using ApplyingService.DTOs;
using ApplyingService.Models;
using ApplyingService.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;

namespace ApplyingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplyController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly GrpcJobPostClient _grpcJobPostClient;

    public ApplyController(IMapper mapper, GrpcJobPostClient grpcJobPostClient)
    {
        _mapper = mapper;
        _grpcJobPostClient = grpcJobPostClient;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<JobPostRequestDto>> Apply(string jobPostId, [FromBody] ApplyDto applicantInfo)
    {
        var jobPost = await DB.Find<JobPost>().OneAsync(jobPostId);

        if (jobPost == null)
        {
            jobPost = _grpcJobPostClient.GetJobPost(jobPostId);

            if (jobPost == null) return BadRequest("Currently cannot accept requests for this job post.");
        }

        if (jobPost.Employer == User.Identity.Name)
        {
            return BadRequest("Employer cannot apply to their own job post.");
        }

        var existingRequest = await DB.Find<JobPostRequest>()
            .Match(jpr => jpr.JobPostId == jobPostId && jpr.Employee == User.Identity.Name)
            .ExecuteFirstAsync();

        if (existingRequest != null)
        {
            return BadRequest("You have already applied to this job post.");
        }

        var jobPostRequest = new JobPostRequest
        {
            JobPostId = jobPostId,
            Employee = User.Identity.Name,
            Status = Status.Pending,
            //Email = User.FindFirstValue(ClaimTypes.Email),
            Email = applicantInfo.Email,
            Phone = applicantInfo.Phone,
            Message = applicantInfo.Message
        }; 

        if (jobPost.Deadline < DateTime.Now)
        {
            jobPostRequest.Status = Status.Rejected;
            return BadRequest("Job post has expired.");
        }

        await DB.SaveAsync(jobPostRequest);

        return Ok(_mapper.Map<JobPostRequestDto>(jobPostRequest));
    }

    [Authorize]
    [HttpGet("my-requests")]	
    public async Task<ActionResult<List<JobPostRequestDto>>> GetMyRequests()
    {
        var requests = await DB.Find<JobPostRequest>()
            .Match(jpr => jpr.Employee == User.Identity.Name)
            .Sort(jpr => jpr.ApplyDate, Order.Descending)
            .ExecuteAsync();
        
        if (requests.Count == 0)
        {
            return Ok(new List<JobPostRequestDto>());
        }

        return Ok(requests.Select(_mapper.Map<JobPostRequestDto>).ToList());
    }

    [Authorize]
    [HttpGet("{jobPostId}")]
    public async Task<ActionResult<List<JobPostRequest>>> GetRequestsForJobPost(string jobPostId)
    {
        var jobPost = await DB.Find<JobPost>().OneAsync(jobPostId);
        if (User.Identity.Name != jobPost.Employer)
        {
            return Unauthorized("You are not the employer of this job post.");
        }

        var jobPostRequests = await DB.Find<JobPostRequest>()
            .Match(jpr => jpr.JobPostId == jobPostId)
            .Sort(jpr => jpr.ApplyDate, Order.Descending)
            .ExecuteAsync();

        return Ok(jobPostRequests.Select(_mapper.Map<JobPostRequestDto>).ToList());
    }


    // TRY PUT HERE
    [Authorize]
    [HttpPut("update-status/{jobPostId}/{employee}")]
    public async Task<ActionResult<JobPostRequestDto>> UpdateRequestStatus(string jobPostId, string employee, [FromBody] UpdateStatusDto updateStatusDto)
    {
        var jobPost = await DB.Find<JobPost>().OneAsync(jobPostId);
        
        if (jobPost == null)
        {
            return BadRequest("Job post not found.");
        }

        if (User.Identity.Name != jobPost.Employer)
        {
            return Unauthorized("You are not the employer of this job post.");
        }

        var jobPostRequest = await DB.Find<JobPostRequest>()
            .Match(jpr => jpr.JobPostId == jobPostId && jpr.Employee == employee)
            .ExecuteFirstAsync();

        if (jobPostRequest == null)
        {
            return BadRequest("Request not found.");
        }

        jobPostRequest.Status = updateStatusDto.Status;
        await DB.SaveAsync(jobPostRequest);

        return Ok(_mapper.Map<JobPostRequestDto>(jobPostRequest));
    }
}