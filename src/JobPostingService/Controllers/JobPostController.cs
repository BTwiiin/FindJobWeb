﻿using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using AutoMapper;
using Contracts;
using JobPostingService.DTOs;
using JobPostingService.Entities;
using JobPostingService.Repository;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace JobPostingService.Controllers;


[ApiController]
[Route("api/[controller]")]
public class JobPostController : Controller
{
    private readonly IJobPostRepository _jobPostRepository;
    private readonly IMapper _mapper;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly IImageUploadService _imageUploadService;

    public JobPostController(IJobPostRepository jobPostRepository, 
                                IMapper mapper, 
                                IPublishEndpoint publishEndpoint, 
                                IImageUploadService imageUploadService)
    {
        _jobPostRepository = jobPostRepository;
        _mapper = mapper;
        _publishEndpoint = publishEndpoint;
        _imageUploadService = imageUploadService;
    }

    #region HttpGet Methods

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

    [HttpGet("get-image/{id}")]
    public async Task<ActionResult<List<string>>> GetImage(Guid id)
    {
        var jobPost = await _jobPostRepository.GetEntityByIdAsync(id);
        if (jobPost == null) return NotFound("Job post not found");

        if (jobPost.PhotoUrls == null || jobPost.PhotoUrls.Count == 0) return Ok(new List<string>());;

        List<string> imageUrls = new List<string>();

        imageUrls = jobPost.PhotoUrls
                    .Select(photoUrl => _imageUploadService.GetPreSignedUrl(photoUrl).Result)
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .ToList();

        return Ok(imageUrls);
    }

    #endregion

    #region HttpPost Methods

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<JobPostDto>> CreateJobPost([FromBody] CreateJobPostDto createJobPostDto)
    {
        var jobPost = _mapper.Map<JobPost>(createJobPostDto);
        jobPost.Employer = User.Identity.Name;

        if (jobPost.Deadline <= DateTime.UtcNow)
        {
            return BadRequest("The deadline must be a future date.");
        }

        // Initialize PhotoUrls list
        jobPost.PhotoUrls = new List<string>();

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
    [HttpPost("upload-image/{id}")]
    public async Task<ActionResult> UploadImage(Guid id, [FromForm] List<IFormFile> images)
    {
        var jobPost = await _jobPostRepository.GetEntityByIdAsync(id);
        if (jobPost == null) return NotFound("Job post not found");

        if (jobPost.Employer != User.Identity.Name) return Forbid();

        // Initialize PhotoUrls list if it's null
        if (jobPost.PhotoUrls == null)
        {
            jobPost.PhotoUrls = new List<string>();
        }

        // Get new image URLs and add them to the existing list
        var newImageUrls = await Task.WhenAll(images.Select(_imageUploadService.SaveImageAsync));
        jobPost.PhotoUrls.AddRange(newImageUrls);

        _jobPostRepository.Update(jobPost);
        var result = await _jobPostRepository.SaveChangesAsync();

        var imageUrls = jobPost.PhotoUrls
                    .Select(photoUrl => _imageUploadService.GetPreSignedUrl(photoUrl).Result)
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .ToList();

        if (result)
        {
            return Ok(new { status = "success", message = "Images uploaded successfully", imageUrls});
        }
        else
        {
            return BadRequest(new { status = "error", message = "No changes were saved to the database"});
        }
    }

    #endregion

    #region HttpPut Methods

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

    #endregion

    #region HttpDelete Methods

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteJobPost(Guid id)
    {
        var jobPost = await _jobPostRepository.GetEntityByIdAsync(id);
        if (jobPost == null) return NotFound();

        if (jobPost.Employer != User.Identity.Name) return Forbid();

        var images = jobPost.PhotoUrls;

        if (images != null && images.Count > 0)
        {
            foreach (var image in images)
            {
                await _imageUploadService.DeleteImageAcync(image);
            }
        }

        _jobPostRepository.RemoveAllSavedPostsByJobPostId(id);

        _jobPostRepository.DeleteJobPost(jobPost);

        await _publishEndpoint.Publish<JobPostDeleted>(new { Id = jobPost.Id.ToString() });

        var result = await _jobPostRepository.SaveChangesAsync();

        if (result) return Ok();
        return BadRequest("Could not delete data");
    }

    [Authorize]
    [HttpDelete("delete-image/{key}/{id}")]
    public async Task<IActionResult> DeleteImageFromJobPost(string key, Guid id)
    {
        var jobPost = await _jobPostRepository.GetEntityByIdAsync(id);
        if (jobPost == null) return NotFound();

        if (jobPost.Employer != User.Identity.Name) return Forbid();

        if (key.IsNullOrEmpty()) return BadRequest("Image URL cannot be empty!");

        var response = await _imageUploadService.DeleteImageAcync(key);
        if (response)
        {
            _jobPostRepository.DeleteImageFromJobPost(jobPost, key);
            _jobPostRepository.Update(jobPost);
            if (await _jobPostRepository.SaveChangesAsync()) return Ok("Image deleted successfully!");
            
        }
        return BadRequest("Failed to delete image!");
    }



    #endregion

    #region Saved Job Post Methods

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

    #endregion
}
