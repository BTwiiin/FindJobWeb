using Contracts;
using JobPostingService.Repository;
using MassTransit;

namespace JobPostingService.Services;

public class CheckJobPostFinished : BackgroundService
{
    private readonly ILogger<CheckJobPostFinished> _logger;
    private readonly IServiceProvider _services;

    public CheckJobPostFinished(ILogger<CheckJobPostFinished> logger, IServiceProvider services)
    {
        _logger = logger;
        _services = services;
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("==> CheckJobPostFinished Service is starting.");

        stoppingToken.Register(() =>
            _logger.LogInformation("==> CheckJobPostFinished Service is stopping."));
        
        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckJobPosts(stoppingToken);

            await Task.Delay(5000, stoppingToken);
        }
    }

    private async Task CheckJobPosts(CancellationToken stoppingToken)
    {
        using (var scope = _services.CreateScope())
        {
            var jobPostRepository = scope.ServiceProvider.GetRequiredService<IJobPostRepository>();

            var finishedJobPosts = await jobPostRepository.GetFinishedJobPosts();

            if (finishedJobPosts.Count == 0) return;

            _logger.LogInformation("==> Found {count} finished job posts.", finishedJobPosts.Count);

            var endpoint = scope.ServiceProvider.GetRequiredService<IPublishEndpoint>();

            foreach (var item in finishedJobPosts)
            {
                item.Status = Entities.Status.Completed;

                await jobPostRepository.SaveChangesAsync();

                await endpoint.Publish(new JobPostDeadlineReached
                {
                    JobPostId = item.Id.ToString(),
                    Employer = item.Employer,
                    Employee = item?.Employee
                }, stoppingToken);
            }
        }

    }
}