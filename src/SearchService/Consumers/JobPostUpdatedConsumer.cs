using AutoMapper;
using Contracts;
using MassTransit;
using Nest;
using SearchService.Models;

namespace SearchService.Consumers
{
    public class JobPostUpdatedConsumer : IConsumer<JobPostUpdated>
    {
        private readonly IElasticClient _elasticClient;
        private readonly IMapper _mapper;

        public JobPostUpdatedConsumer(IElasticClient elasticClient, IMapper mapper)
        {
            _elasticClient = elasticClient;
            _mapper = mapper;
        }

        public async Task Consume(ConsumeContext<JobPostUpdated> context)
        {
            Console.WriteLine($"--> Received JobPostUpdated event: {context.Message.Id}");

            // Map the incoming message to the JobPost model
            var updatedJobPost = _mapper.Map<JobPost>(context.Message);

            // Update the document in Elasticsearch
            var response = await _elasticClient.UpdateAsync<JobPost>(
                context.Message.Id,
                u => u
                    .Index("jobposts")
                    .Doc(updatedJobPost)
                    .DocAsUpsert(true) // Creates the document if it does not exist
            );

            if (!response.IsValid)
            {
                Console.WriteLine($"Failed to update job post: {response.DebugInformation}");
                throw new Exception($"Failed to update job post: {response.ServerError?.Error?.Reason}");
            }

            Console.WriteLine($"Job post with ID {context.Message.Id} updated successfully in Elasticsearch.");
        }
    }
}
