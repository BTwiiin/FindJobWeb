using Contracts;
using MassTransit;
using SearchService.Models;
using SearchService.Repository;

namespace SearchService.Consumers
{
    public class JobPostDeadlineReachedConsumer : IConsumer<JobPostDeadlineReached>
    {
        private readonly IElasticRepository<JobPost> _elasticRepository;

        public JobPostDeadlineReachedConsumer(IElasticRepository<JobPost> elasticRepository)
        {
            _elasticRepository = elasticRepository;
        }

        public async Task Consume(ConsumeContext<JobPostDeadlineReached> context)
        {
            Console.WriteLine($"JobPostDeadlineReached: {context.Message.JobPostId}");

            // TODO: Add field to JobPost model to mark as finished, for now just delete
            await _elasticRepository.DeleteAsync(context.Message.JobPostId, "jobposts");

            Console.WriteLine($"Job post with ID {context.Message.JobPostId} deleted successfully from Elasticsearch.");
        }
    }
}
