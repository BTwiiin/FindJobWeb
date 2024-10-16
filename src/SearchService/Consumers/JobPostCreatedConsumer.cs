using AutoMapper;
using Contracts;
using MassTransit;
using MongoDB.Entities;
using SearchService.Models;

namespace SearchService.Consumers
{
    public class JobPostCreatedConsumer : IConsumer<JobPostCreated>
    {
        private readonly IMapper _mapper;
        public JobPostCreatedConsumer(IMapper mapper)
        {
            _mapper = mapper;
        }
        public async Task Consume(ConsumeContext<JobPostCreated> context)
        {
            Console.WriteLine($"--> Received JobPostCreated event: {context.Message.Id}");

            var item = _mapper.Map<JobPost>(context.Message);

            await item.SaveAsync();
        }
    }
}
