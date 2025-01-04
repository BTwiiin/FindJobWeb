using AutoMapper;
using Contracts;
using MassTransit;
using MongoDB.Entities;
using Nest;
using SearchService.Models;

namespace SearchService.Consumers
{
    public class JobPostCreatedConsumer : IConsumer<JobPostCreated>
    {
        private readonly IMapper _mapper;
        private readonly IElasticClient _elasticClient;
        public JobPostCreatedConsumer(IMapper mapper, IElasticClient elasticClient)
        {
            _mapper = mapper;

            _elasticClient = elasticClient;
        }
        public async Task Consume(ConsumeContext<JobPostCreated> context)
        {
            Console.WriteLine($"--> Received JobPostCreated event: {context.Message.Id}");

            // Map the event to the JobPost model
            var jobPost = _mapper.Map<JobPost>(context.Message);

            // Index the document in Elasticsearch
            var response = await _elasticClient.IndexAsync(jobPost, idx => idx
                .Index("jobposts")   // Index name
                .Id(jobPost.Id));    // Document ID

            if (!response.IsValid)
            {
                throw new Exception($"Failed to index document: {response.ServerError}");
            }

            Console.WriteLine($"Indexed JobPost with ID: {jobPost.Id}");
        }
    }
}
