using Contracts;
using JobPostingService.Data;
using JobPostingService.Entities;
using MassTransit;

namespace JobPostingService.Consumers
{
    public class JobPostTimedUpConsumer : IConsumer<JobPostTimedUp>
    {
        private readonly JobPostingDbContext _context;
        public JobPostTimedUpConsumer(JobPostingDbContext context)
        {
            _context = context;
        }
        public async Task Consume(ConsumeContext<JobPostTimedUp> context)
        {
            Console.WriteLine("--> Consuming JobPostTimedUp");

            var jobPost = await _context.JobPosts.FindAsync(context.Message.JobPostId);

            if (jobPost != null)
            {
                jobPost.Status = jobPost.Employee != null ? Status.Completed : Status.Cancelled;
            }

            await _context.SaveChangesAsync();
        }
    }
}
