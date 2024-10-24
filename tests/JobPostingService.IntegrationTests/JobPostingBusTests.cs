
using System.Net;
using System.Net.Http.Json;
using Contracts;
using JobPostingService.Data;
using JobPostingService.DTOs;
using MassTransit.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace JobPostingService.IntegrationTests;

[Collection("SharedFixture")]
public class JobPostingBusTests : IAsyncLifetime
{
    private readonly CustomWebAppFactory _factory;
    private readonly HttpClient _httpClient;
    private readonly ITestHarness _testHarness;
    private string GT_ID = "f5b1b3b4-3b3b-4b3b-8b3b-3b3b3b3b3b3b";
    public JobPostingBusTests(CustomWebAppFactory factory)
    {
        _factory = factory;
        _httpClient = _factory.CreateClient();
        _testHarness = _factory.Services.GetTestHarness();
    }

    [Fact]
    public async Task CreateJobPost_WithValidParamsAndAuth_ShouldPublishJobPostCreated()
    {
        // Arrange
        var jobpost = GetJobPostForCreate();
        _httpClient.SetFakeJwtBearerToken(AuthHelper.GetBearerForUser("testUser"));

        // Act
        var response = await _httpClient.PostAsJsonAsync("/api/jobpost", jobpost);

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.True(await _testHarness.Published.Any<JobPostCreated>());
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