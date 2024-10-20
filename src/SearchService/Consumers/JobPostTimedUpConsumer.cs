using MassTransit;
using Contracts;
using SearchService.Models;
using MongoDB.Entities;

namespace SearchService.Consumers
{
    public class JobPostTimedUpConsumer : IConsumer<JobPostTimedUp>
    {
        public async Task Consume(ConsumeContext<JobPostTimedUp> context)
        {
            var jobpost = await DB.Find<JobPost>().OneAsync(context.Message.JobPostId);

            jobpost.Status = jobpost.Employer != null ? "completed" : "expired";
        }
    }
}
