using Contracts;
using MassTransit;
using MongoDB.Entities;
using SearchService.Models;

namespace SearchService.Consumers
{
    public class JobPostDeletedConsumer : IConsumer<JobPostDeleted>
    {
        public async Task Consume(ConsumeContext<JobPostDeleted> context)
        {
            Console.WriteLine($"JobPostDeletedConsumer: {context.Message.Id}");

            var result = await DB.DeleteAsync<JobPost>(context.Message.Id);

            if (!result.IsAcknowledged) throw new MessageException(typeof(JobPostDeleted), "Could not delete JobPost from the db");
        }
    }
}
