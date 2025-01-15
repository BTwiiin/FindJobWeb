using ApplyingService.Models;
using Contracts;
using MassTransit;
using MongoDB.Entities;

namespace ApplyingService.Consumers;

class JobPostCreatedConsumer : IConsumer<JobPostCreated>
{
    public async Task Consume(ConsumeContext<JobPostCreated> context)
    {
        Console.WriteLine($"--> Received JobPostCreated event: {context.Message.Id}");

        var jobPost = new JobPost
        {
            Id = context.Message.Id.ToString(),
            Deadline = context.Message.Deadline,
            Employer = context.Message.Employer,
            Finished = false
        };
        
        await jobPost.SaveAsync();

        Console.WriteLine($"Indexed JobPost with ID: {jobPost.Id}");
    }
}