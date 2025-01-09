using Contracts;
using MassTransit;
using SearchService.Models;
using SearchService.Repository;

namespace SearchService.Consumers
{
    public class JobPostDeletedConsumer : IConsumer<JobPostDeleted>
    {
        private readonly IElasticRepository<JobPost> _elasticRepository;

        public JobPostDeletedConsumer(IElasticRepository<JobPost> elasticRepository)
        {
            _elasticRepository = elasticRepository;
        }

        public async Task Consume(ConsumeContext<JobPostDeleted> context)
        {
            Console.WriteLine($"JobPostDeletedConsumer: {context.Message.Id}");

            await _elasticRepository.DeleteAsync(context.Message.Id, "jobposts");

            Console.WriteLine($"Job post with ID {context.Message.Id} deleted successfully from Elasticsearch.");
        }
    }
}
