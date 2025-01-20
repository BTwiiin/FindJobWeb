using ApplyingService.Models;
using Contracts;
using MassTransit;
using MongoDB.Entities;

namespace ApplyingService.Consumers
{
    public class JobPostDeadlineReachedConsumer : IConsumer<JobPostDeadlineReached>
    {
        public async Task Consume(ConsumeContext<JobPostDeadlineReached> context)
        {
            Console.WriteLine($"--> Received JobPostDeadlineReached event: {context.Message.JobPostId}");

            var jobPost = await DB.Find<JobPost>()
                .OneAsync(context.Message.JobPostId);

            jobPost.Finished = true;

            await jobPost.SaveAsync();

            var jobPostRequests = await DB.Find<JobPostRequest>()
                .Match(jpr => jpr.JobPostId == context.Message.JobPostId)
                .ExecuteAsync();
            
            foreach (var item in jobPostRequests)
            {
                if (item.Status == Status.Approved) continue;
                
                item.Status = Status.Rejected;
            }

            await DB.SaveAsync(jobPostRequests);

            Console.WriteLine($"--> Requests should get Status: {Status.Rejected}");
        }
    }
}