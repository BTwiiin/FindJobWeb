using Contracts;
using MassTransit;
using Nest;
using SearchService.Models;

namespace SearchService.Consumers
{
    public class JobPostDeletedConsumer : IConsumer<JobPostDeleted>
    {
        private readonly IElasticClient _elasticClient;

        public JobPostDeletedConsumer(IElasticClient elasticClient)
        {
            _elasticClient = elasticClient;
        }

        public async Task Consume(ConsumeContext<JobPostDeleted> context)
        {
            Console.WriteLine($"JobPostDeletedConsumer: {context.Message.Id}");

            var response = await _elasticClient.DeleteAsync<JobPost>(context.Message.Id, d => d.Index("jobposts"));

            if (!response.IsValid)
            {
                Console.WriteLine($"Failed to delete job post: {response.DebugInformation}");
                throw new Exception($"Failed to delete job post: {response.ServerError?.Error?.Reason}");
            }

            Console.WriteLine($"Job post with ID {context.Message.Id} deleted successfully from Elasticsearch.");
        }
    }
}
