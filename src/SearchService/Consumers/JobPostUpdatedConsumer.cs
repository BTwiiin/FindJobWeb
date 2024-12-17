using AutoMapper;
using Contracts;
using MassTransit;
using MongoDB.Entities;
using SearchService.Models;

namespace SearchService.Consumers
{
    public class JobPostUpdatedConsumer : IConsumer<JobPostUpdated>
    {
        private readonly IMapper _mapper;

        public JobPostUpdatedConsumer(IMapper mapper)
        {
            _mapper = mapper;
        }

        public async Task Consume(ConsumeContext<JobPostUpdated> context)
        {
            Console.WriteLine($"--> Received JobPostUpdated event: {context.Message.Id}");

            var item = _mapper.Map<JobPost>(context.Message);

            var result =  await DB.Update<JobPost>()
                     .Match(a => a.ID == context.Message.Id)
                     .ModifyOnly(x => new
                     {
                         x.Title,
                         x.Description,
                         x.PaymentAmount,
                         x.Deadline,
                         x.Category,
                         x.Location
                     }, item)
                     .ExecuteAsync();

            if (!result.IsAcknowledged)
                throw new MessageException(typeof(JobPostUpdated), "Problem updating mongoDb");
        }
    }
}
