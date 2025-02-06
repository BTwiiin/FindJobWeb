using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Contracts;

namespace NotificationService.Hubs;
public class JobPostRequestPlacedConsumer : IConsumer<JobPostRequestPlaced>
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public JobPostRequestPlacedConsumer(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task Consume(ConsumeContext<JobPostRequestPlaced> context)
    {
        Console.WriteLine($"--> Received JobPostRequestPlaced event: {context.Message.Id}");

        var jobOwner = context.Message.Employer;

        Console.WriteLine($"--> Owner of the job post: {jobOwner}");

        if (!string.IsNullOrEmpty(jobOwner))
        {
            Console.WriteLine($"--> Sending notification to job owner: {jobOwner}");
            var connections = NotificationHub.GetUserConnections(jobOwner);
            
            foreach (var connectionId in connections)
            {
                Console.WriteLine($"--> Sending notification to connectionId: {connectionId}");
                await _hubContext.Clients.Client(connectionId)
                    .SendAsync("ReceiveJobPostRequestPlaced", $"New application for your job: {context.Message.JobPostId}");
            }
        }
    }
}
