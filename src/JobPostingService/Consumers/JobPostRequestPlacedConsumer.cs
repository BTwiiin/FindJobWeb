using Contracts;
using JobPostingService.Data;
using MassTransit;

namespace JobPostingService.Consumers
{
    public class JobPostRequestPlacedConsumer : IConsumer<JobPostRequestPlaced>
    {
        private readonly JobPostingDbContext _context;
        public JobPostRequestPlacedConsumer(JobPostingDbContext context)
        {
            _context = context;
        }
        public async Task Consume(ConsumeContext<JobPostRequestPlaced> context)
        {
            Console.WriteLine("--> Consuming JobPostRequestPlaced");

            var jobpost = await _context.JobPosts.FindAsync(context.Message.JobPostId);

            // TODO: Still to be implemented
        }
    }
}
