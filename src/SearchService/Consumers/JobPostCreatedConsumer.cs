using AutoMapper;
using Contracts;
using MassTransit;
using SearchService.Models;
using SearchService.Repository;

namespace SearchService.Consumers
{
    public class JobPostCreatedConsumer : IConsumer<JobPostCreated>
    {
        private readonly IMapper _mapper;
        private readonly IElasticRepository<JobPost> _elasticRepository;
        
        public JobPostCreatedConsumer(IMapper mapper, IElasticRepository<JobPost> elasticRepository)
        {
            _mapper = mapper;
            _elasticRepository = elasticRepository ?? throw new ArgumentNullException(nameof(elasticRepository));
        }
        public async Task Consume(ConsumeContext<JobPostCreated> context)
        {
            Console.WriteLine($"--> Received JobPostCreated event: {context.Message.Id}");

            // Map the event to the JobPost model
            var jobPost = _mapper.Map<JobPost>(context.Message);

            await _elasticRepository.AddAsync(jobPost, "jobposts");

            Console.WriteLine($"Indexed JobPost with ID: {jobPost.Id}");
        }
    }
}
