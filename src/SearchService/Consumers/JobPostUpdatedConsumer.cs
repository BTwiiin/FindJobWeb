using AutoMapper;
using Contracts;
using MassTransit;
using Nest;
using SearchService.Models;
using SearchService.Repository;

namespace SearchService.Consumers
{
    public class JobPostUpdatedConsumer : IConsumer<JobPostUpdated>
    {
        private readonly IElasticRepository<JobPost> _elasticRepository;
        private readonly IMapper _mapper;

        public JobPostUpdatedConsumer(IElasticRepository<JobPost> elasticRepository, IMapper mapper)
        {
            
            _mapper = mapper;
            _elasticRepository = elasticRepository;
        }

        public async Task Consume(ConsumeContext<JobPostUpdated> context)
        {
            Console.WriteLine($"--> Received JobPostUpdated event: {context.Message.Id}");

            // Map the incoming message to the JobPost model
            var updatedJobPost = _mapper.Map<JobPost>(context.Message);

            // Update the document in Elasticsearch
            await _elasticRepository.UpdateAsync(context.Message.Id, updatedJobPost, "jobposts");

            Console.WriteLine($"Job post with ID {context.Message.Id} updated successfully in Elasticsearch.");
        }
    }
}
