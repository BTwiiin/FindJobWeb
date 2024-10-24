
using System.Net;
using System.Net.Http.Json;
using JobPostingService.Data;
using JobPostingService.DTOs;
using Microsoft.Extensions.DependencyInjection;

namespace JobPostingService.IntegrationTests;

[Collection("SharedFixture")]
public class JobPostingControllerTests : IAsyncLifetime
{
    private readonly CustomWebAppFactory _factory;
    private readonly HttpClient _httpClient;
    private string GT_ID = "f5b1b3b4-3b3b-4b3b-8b3b-3b3b3b3b3b3b";
    public JobPostingControllerTests(CustomWebAppFactory factory)
    {
        _factory = factory;
        _httpClient = _factory.CreateClient();
    }

    [Fact]
    public async Task GetJobPosts_ShouldReturn5JobPosts()
    {
        // Arrange

        // Act
        var response = await _httpClient.GetFromJsonAsync<List<JobPostDto>>("/api/jobpost");

        // Assert
        Assert.Equal(5, response.Count);
    }

    [Fact]
    public async Task GetJobPostById_WithValidId_ShouldReturnAction()
    {
        // Arrange

        // Act
        var response = await _httpClient.GetFromJsonAsync<JobPostDto>($"/api/jobpost/{GT_ID}");

        // Assert
        Assert.Equal("Math Tutoring", response.Title);
        Assert.IsType<JobPostDto>(response);
    }


    
    [Fact]
    public async Task GetJobPostById_WithInvalidId_ShouldReturn404()
    {
        // Arrange

        // Act
        var response = await _httpClient.GetAsync($"/api/jobpost/{Guid.NewGuid()}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetJobPostById_WithInvalidId_ShouldReturn400()
    {
        // Arrange
        var id = "not a Guid";
        // Act
        var response = await _httpClient.GetAsync($"/api/jobpost/{id}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateJobPost_WithNoAuth_ShouldReturn401()
    {
        // Arrange
        var jobPost = new CreateJobPostDto
        {
            Title = "Test Job",
            Description = "Test Description",
            PaymentAmount = 100,
            Deadline = DateTime.UtcNow.AddDays(5),
            Category = "Marketing"
        };

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/jobpost", jobPost);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateJobPost_WithAuth_ShouldReturn201()
    {
        // Arrange
        var jobPost = GetJobPostForCreate();
        _httpClient.SetFakeJwtBearerToken(AuthHelper.GetBearerForUser("testUser"));

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/jobpost", jobPost);
        var createdJobPost = await response.Content.ReadFromJsonAsync<JobPostDto>();

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("testUser", createdJobPost.Employer);
    }

    [Fact]
    public async Task CreateJobPost_WithInvalidModel_ShouldReturn400()
    {
        // Arrange
        var jobPost = new CreateJobPostDto
        {
            Title = "Test Job",
            Description = "Test Description",
            PaymentAmount = 100,
            Deadline = DateTime.UtcNow.AddDays(5),
            Category = null
        };
        _httpClient.SetFakeJwtBearerToken(AuthHelper.GetBearerForUser("testUser"));

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/jobpost", jobPost);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateJobPost_WithNoAuth_ShouldReturn401()
    {
        // Arrange
        var jobPost = GetJobPostForCreate();

        // Act
        var response = await _httpClient.PutAsJsonAsync($"/api/jobpost/{GT_ID}", jobPost);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateJobPost_WithValidUpdateDtoAndUser_ShouldReturn200()
    {
        // arrange
        var updatedJobPost = new UpdateJobPostDto { Title = "Updated" };
        _httpClient.SetFakeJwtBearerToken(AuthHelper.GetBearerForUser("Jane Smith"));

        // act
        var response = await _httpClient.PutAsJsonAsync($"api/jobpost/{GT_ID}", updatedJobPost);

        // assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UpdateJobPost_WithInvalidCategory_ShouldReturn400()
    {
        // arrange
        var updatedJobPost = new UpdateJobPostDto { Category = "Invalid" };
        _httpClient.SetFakeJwtBearerToken(AuthHelper.GetBearerForUser("Jane Smith"));

        // act
        var response = await _httpClient.PutAsJsonAsync($"api/jobpost/{GT_ID}", updatedJobPost);

        // assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateJobPost_WithValidUpdateDtoAndInvalidUser_ShouldReturn403()
    {
        // Arrange
        var updatedJobPost = new UpdateJobPostDto { Title = "Updated" };
        _httpClient.SetFakeJwtBearerToken(AuthHelper.GetBearerForUser("testUser"));

        // Act
        var response = await _httpClient.PutAsJsonAsync($"api/jobpost/{GT_ID}", updatedJobPost);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeleteJobPost_WithNoAuth_ShouldReturn401()
    {
        // Arrange

        // Act
        var response = await _httpClient.DeleteAsync($"/api/jobpost/{GT_ID}");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteJobPost_WithValidIdAndUser_ShouldReturn200()
    {
        // Arrange
        _httpClient.SetFakeJwtBearerToken(AuthHelper.GetBearerForUser("Jane Smith"));

        // Act
        var response = await _httpClient.DeleteAsync($"/api/jobpost/{GT_ID}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }


    public Task InitializeAsync() => Task.CompletedTask;

    public Task DisposeAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<JobPostingDbContext>();
        DbHelper.ReinitDbForTests(db);
        return Task.CompletedTask;
    }

    private CreateJobPostDto GetJobPostForCreate()
    {
        return new CreateJobPostDto
        {
            Title = "Test Job",
            Description = "Test Description",
            PaymentAmount = 100,
            Deadline = DateTime.UtcNow.AddDays(5),
            Category = "Marketing"
        };
    }
}