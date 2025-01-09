using System.Net.Sockets;
using Nest;
using SearchService.Models;
using SearchService.Repository;
using SearchService.Services;

namespace SearchService.Data
{
    public static class DbInitializer
    {
        public static async Task InitDb(WebApplication app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var scopedServices = scope.ServiceProvider;
                var httpClient = scopedServices.GetRequiredService<JobPostingSvcHttpClient>();
                var elasticRepository = scopedServices.GetRequiredService<IElasticRepository<JobPost>>();

                await ConnectionChecks(elasticRepository);
                await HealthChecks(elasticRepository);
                await CreateIndexAndSeedData(elasticRepository, httpClient);

                Console.WriteLine("Elasticsearch initialization completed.");
            }
        }

        private static async Task ConnectionChecks(IElasticRepository<JobPost> elasticRepository)
        {
            const int maxRetries = 10;
            const int delayInSeconds = 5;
            var retries = 0;

            while (retries < maxRetries)
            {
                try
                {
                    var pingResponse = await elasticRepository.CheckConnectionAsync();
                    if (pingResponse)
                    {
                        Console.WriteLine("Elasticsearch is ready.");
                        break;
                    }
                }
                catch (SocketException ex)
                {
                    Console.WriteLine($"Elasticsearch is not available. Retry {retries + 1}/{maxRetries} in {delayInSeconds} seconds. Error: {ex.Message}");
                }
                retries++;
                await Task.Delay(TimeSpan.FromSeconds(delayInSeconds));
            }

            if (retries == maxRetries)
            {
                throw new Exception("Elasticsearch is unavailable after multiple retries.");
            }
        }

        private static async Task CreateIndexAndSeedData(IElasticRepository<JobPost> elasticRepository, JobPostingSvcHttpClient httpClient)
        {
            var jobPosts = await httpClient.GetJobPostsForSearchDb();

            foreach (var batch in jobPosts.Chunk(1000))
            {
                foreach (var jobPost in batch)
                {
                    try
                    {
                        await elasticRepository.AddAsync(jobPost);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Failed to index document {jobPost.Id}: {ex.Message}");
                    }
                }
            }
        }

        private static async Task HealthChecks(IElasticRepository<JobPost> elasticRepository)
        {
            var healthStatus = await elasticRepository.CheckClusterHealthAsync();

            if (healthStatus.Status == Elasticsearch.Net.Health.Red)
            {
                throw new Exception("Elasticsearch cluster health is red.");
            }
            else if (healthStatus.Status == Elasticsearch.Net.Health.Yellow)
            {
                Console.WriteLine("Elasticsearch cluster health is yellow. Proceeding with caution.");
            }
            else
            {
                Console.WriteLine("Elasticsearch cluster health is green.");
            }
        }
    }
}
