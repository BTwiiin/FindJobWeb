using Nest;
using SearchService.Models;

namespace SearchService.Services
{
    public class JobPostingSvcHttpClient
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly IElasticClient _elasticClient;

        public JobPostingSvcHttpClient(HttpClient httpClient, IConfiguration config, IElasticClient elasticClient)
        {
            _httpClient = httpClient;
            _config = config;
            _elasticClient = elasticClient;
        }

        public async Task<List<JobPost>> GetJobPostsForSearchDb()
        {
            // Fetch the most recent 'UpdatedAt' timestamp from Elasticsearch
            var searchResponse = await _elasticClient.SearchAsync<JobPost>(s => s
                .Index("jobposts")          // <-- explicitly specify the index
                .Sort(so => so
                    .Descending(p => p.UpdatedAt)
                )
                .Size(1)
                .Source(sf => sf
                    .Includes(i => i.Field(f => f.UpdatedAt))
                )
            );


            var lastUpdated = searchResponse.Documents.FirstOrDefault()?.UpdatedAt;

            // Retrieve the new job posts using the JobPostingService API
            var url = $"{_config["JobPostingServiceUrl"]}/api/jobpost";
            if (lastUpdated.HasValue)
            {
                url += $"?date={lastUpdated.Value:O}";
            }

            var jobPosts = await _httpClient.GetFromJsonAsync<List<JobPost>>(url);

            // Bulk index new job posts to Elasticsearch
            if (jobPosts != null && jobPosts.Any())
            {
                var bulkResponse = await _elasticClient.BulkAsync(b => b
                    .Index("jobposts")
                    .IndexMany(jobPosts, (d, jobPost) => d.Id(jobPost.Id))
                );

                if (!bulkResponse.IsValid)
                {
                    Console.WriteLine($"Failed to index documents: {bulkResponse.DebugInformation}");
                }
                else
                {
                    Console.WriteLine($"Indexed {bulkResponse.Items.Count} documents successfully.");
                }
            }

            return jobPosts ?? new List<JobPost>();
        }
    }
}
