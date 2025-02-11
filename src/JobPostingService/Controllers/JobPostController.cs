﻿using System.ComponentModel.DataAnnotations.Schema;
using AutoMapper;
using Contracts;
using JobPostingService.DTOs;
using JobPostingService.Entities;
using JobPostingService.Repository;
using MassTransit;
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

        var jobPostDto = _mapper.Map<JobPostDto>(jobPost);

        if (User.Identity?.IsAuthenticated == true)
        {
            var username = User.Identity.Name!;
            jobPostDto.IsSaved = await _jobPostRepository.IsJobPostSaved(id, username);
        }

        return jobPostDto;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<JobPostDto>> CreateJobPost(CreateJobPostDto createJobPostDto)
    {
        var jobPost = _mapper.Map<JobPost>(createJobPostDto);

        jobPost.Employer = User.Identity.Name;

        if (jobPost.Deadline <= DateTime.UtcNow)
        {
            return BadRequest("The deadline must be a future date.");
        }
        
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

        if (jobPost.Employer != User.Identity?.Name) return Forbid();

        jobPost.Title = updateJobPostDto.Title ?? jobPost.Title;
        jobPost.Description = updateJobPostDto.Description ?? jobPost.Description;
        jobPost.PaymentAmount = updateJobPostDto.PaymentAmount ?? jobPost.PaymentAmount;
        jobPost.Deadline = updateJobPostDto.Deadline ?? jobPost.Deadline;

        if (updateJobPostDto.Category != null)
        {
            if (Enum.TryParse(updateJobPostDto.Category, ignoreCase: true, out Category category))
            {
                jobPost.Category = category;
            }
            else
            {
                return BadRequest("Invalid category value");
            }
        }

        if (updateJobPostDto.Location != null)
        {
            jobPost.Location.City = updateJobPostDto.Location.City ?? jobPost.Location.City;
            jobPost.Location.District = updateJobPostDto.Location.District ?? jobPost.Location.District;
            jobPost.Location.Street = updateJobPostDto.Location.Street ?? jobPost.Location.Street;
            jobPost.Location.Latitude = updateJobPostDto.Location.Latitude != default
                ? updateJobPostDto.Location.Latitude
                : jobPost.Location.Latitude;
            jobPost.Location.Longitude = updateJobPostDto.Location.Longitude != default
                ? updateJobPostDto.Location.Longitude
                : jobPost.Location.Longitude;
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

        _jobPostRepository.RemoveAllSavedPostsByJobPostId(id);

        _jobPostRepository.DeleteJobPost(jobPost);

        await _publishEndpoint.Publish<JobPostDeleted>(new { Id = jobPost.Id.ToString() });

        var result = await _jobPostRepository.SaveChangesAsync();

        if (result) return Ok();
        return BadRequest("Could not delete data");
    }

    [Authorize]
    [HttpPost("save/{id}")]
    public async Task<ActionResult> SaveJobPost(Guid id)
    {
        Console.WriteLine($"Saving job post with id: {id} and type: {id.GetType()}");
        if (!await _jobPostRepository.ExistsJobPost(id)) return BadRequest($"There is no Job post with id: {id}");
        
        var username = User.Identity?.Name;
        if (username == null) return Unauthorized();

        if (await _jobPostRepository.IsJobPostSaved(id, User.Identity.Name!))
        {
            _jobPostRepository.DeleteSavedPost(
                new SavedPost
                {
                    JobPostId = id,
                    Username = username
                }
            );

            //await _publishEndpoint.Publish<JobPostUnsaved>(new { Id = id.ToString() });     
        } 
        else
        {
            _jobPostRepository.SaveJobPost(
                new SavedPost
                {
                    JobPostId = id,
                    Username = username,
                    SavedAt = DateTime.UtcNow
                }
            );      

            //await _publishEndpoint.Publish<JobPostSaved>(savedPost);  
        }
        

        var result = await _jobPostRepository.SaveChangesAsync();

        if (!result) return BadRequest("Could not save changes to the db");

        return Ok();
    }

    [Authorize]
    [HttpGet("saved")]
    public async Task<ActionResult<List<SavedPost>>> GetSavedJobsForUser()
    {
        var username = User.Identity?.Name;
        if (username == null) return Unauthorized();

        var savedPosts = await _jobPostRepository.GetSavedPosts(username);
        if (savedPosts == null || savedPosts.Count == 0)
        {
            return NotFound("No saved posts found for the user.");
        }
        return Ok(savedPosts);

    }
}
