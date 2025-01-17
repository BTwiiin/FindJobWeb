using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Hubs;

public class JobPostCreatedConsumer : IConsumer<JobPostCreated>
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public JobPostCreatedConsumer(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task Consume(ConsumeContext<JobPostCreated> context)
    {
        Console.WriteLine($"--> Received JobPostCreated event: {context.Message.Id}");

        // Broadcast the message to all clients
        // Update Client Side to ask a Client to update the UI
        return _hubContext.Clients.All.SendAsync("ReceiveMessage", context.Message);
    }
}