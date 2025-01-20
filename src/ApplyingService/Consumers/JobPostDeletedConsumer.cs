using ApplyingService.Models;
using Contracts;
using MassTransit;
using MongoDB.Entities;

namespace ApplyingService.Consumers
{
    public class JobPostDeletedConsumer : IConsumer<JobPostDeleted>
    {
        public async Task Consume(ConsumeContext<JobPostDeleted> context)
        {
            Console.WriteLine($"--> Received JobPostDeleted event: {context.Message.Id}");

            var jobPost = await DB.Find<JobPost>()
                .OneAsync(context.Message.Id);

            var jobPostRequests = await DB.Find<JobPostRequest>()
                .Match(jpr => jpr.JobPostId == context.Message.Id)
                .ExecuteAsync();
            
            foreach (var item in jobPostRequests)
            {
                item.Status = Status.Rejected;
            }

            await DB.SaveAsync(jobPostRequests);

            await jobPost.DeleteAsync();

            Console.WriteLine($"--> Requests should get Status: {Status.Rejected}");
        }
    }
}