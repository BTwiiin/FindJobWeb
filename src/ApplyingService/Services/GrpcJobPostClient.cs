using ApplyingService.Models;
using Grpc.Net.Client;
using JobPostingService.Protos;

namespace ApplyingService.Services;


public class GrpcJobPostClient
{
    private readonly ILogger<GrpcJobPostClient> _logger;
    private readonly IConfiguration _config;

    public GrpcJobPostClient(ILogger<GrpcJobPostClient> logger, IConfiguration config)
    {
        _logger = logger;
        _config = config;
    }

    public JobPost GetJobPost(string id)
    {
        _logger.LogInformation("==> Calling gRPC Server");

        var channel = GrpcChannel.ForAddress(_config["GrpcJobPost"]);
        var client = new GrpcJobPost.GrpcJobPostClient(channel);
        var request = new GetJobPostRequest { Id = id };

        try
        {
            var reply = client.GetJobPosts(request);
            var jobPost = new JobPost
            {
                ID = reply.JobPost.Id,
                Deadline = DateTime.Parse(reply.JobPost.Deadline),
                Employer = reply.JobPost.Employer,
                Finished = DateTime.Parse(reply.JobPost.Deadline) < DateTime.Now
            };

            return jobPost;
        }
        catch(Exception ex)
        {
            _logger.LogError($"Error: {ex.Message}, Could not call gRPC server");
            return null;
        }
    }
}