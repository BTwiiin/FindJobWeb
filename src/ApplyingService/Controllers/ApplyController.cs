using System.Security.Claims;
using ApplyingService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;

namespace ApplyingService.Controllers;

[ApiController]
[Route("api/[controller]")]
class ApplyController : ControllerBase
{
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<JobPostRequest>> Apply(string jobPostId, string email, string phone, string message)
    {
        var jobPost = await DB.Find<JobPost>().OneAsync(jobPostId);

        if (jobPost == null)
        {
            // TODO: check in JobPostingService DB
            return NotFound();
        }

        if (jobPost.Employer == User.Identity.Name)
        {
            return BadRequest("Employer cannot apply to their own job post.");
        }

        var jobPostRequest = new JobPostRequest
        {
            JobPostId = jobPostId,
            Employee = User.Identity.Name,
            Status = Status.Pending,
            //Email = User.FindFirstValue(ClaimTypes.Email),
            Email = email,
            Phone = phone,
            Message = message
        };

        if (jobPost.Deadline < DateTime.Now)
        {
            jobPostRequest.Status = Status.Rejected;
            return BadRequest("Job post has expired.");
        }

        await DB.SaveAsync(jobPostRequest);

        return Ok(jobPostRequest);
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<JobPostRequest>>> GetMyRequests()
    {
        var requests = await DB.Find<JobPostRequest>()
            .Match(jpr => jpr.Employee == User.Identity.Name)
            .Sort(jpr => jpr.ApplyDate, Order.Descending)
            .ExecuteAsync();

        return Ok(requests);
    }

    [Authorize]
    [HttpGet("{jobPostId}")]
    public async Task<ActionResult<List<JobPostRequest>>> GetRequestsForJobPost(string jobPostId)
    {
        var jobPostRequests = await DB.Find<JobPostRequest>()
            .Match(jpr => jpr.JobPostId == jobPostId)
            .Sort(jpr => jpr.ApplyDate, Order.Descending)
            .ExecuteAsync();

        return Ok(jobPostRequests);
    }
}