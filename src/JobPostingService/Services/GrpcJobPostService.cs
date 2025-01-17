using Grpc.Core;
using JobPostingService.Data;
using JobPostingService.Protos;

namespace JobPostingService.Services;

public class GrpcJobPostService : GrpcJobPost.GrpcJobPostBase
{
    private readonly JobPostingDbContext _dbContext;
    public GrpcJobPostService(JobPostingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task<GrpcJobPostResponse> GetJobPosts(GetJobPostRequest request, ServerCallContext context)
    {
        Console.WriteLine("==> Received gRPC request for GetJobPost");

        var jobPost = await _dbContext.JobPosts.FindAsync(Guid.Parse(request.Id)) ??
            throw new RpcException(new Status(StatusCode.NotFound, "Job post not found"));
            
        return new GrpcJobPostResponse
        {
            JobPost = new GrpcJobPostModel
            {
                Id = jobPost.Id.ToString(),
                Deadline = jobPost.Deadline.ToString(),
                Employer = jobPost.Employer,
            }
        };
        
    }

}