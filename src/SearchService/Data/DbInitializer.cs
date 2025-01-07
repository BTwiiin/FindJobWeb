using Elasticsearch.Net;
using Nest;
using SearchService.Models;
using SearchService.Services;
using System.Net.Sockets;

namespace SearchService.Data
{
    public static class DbInitializer
    {
        public static async Task InitDb(WebApplication app)
        {
            var elasticClient = app.Services.GetRequiredService<IElasticClient>();
            var httpClient = app.Services.GetRequiredService<JobPostingSvcHttpClient>();
            
            var indexName = "jobposts";

            // Retry logic to wait for Elasticsearch to be ready
            const int maxRetries = 10;
            const int delayInSeconds = 5;
            var retries = 0;

            while (retries < maxRetries)
            {
                var pingResponse = await elasticClient.PingAsync();

                if (pingResponse.IsValid)
                {
                    Console.WriteLine("Elasticsearch is ready.");
                    break;
                }
                else
                {
                    retries++;
                    Console.WriteLine($"Elasticsearch ping was invalid (status: {pingResponse.ApiCall.HttpStatusCode}). Retrying in {delayInSeconds} seconds... ({retries}/{maxRetries})");
                    await Task.Delay(TimeSpan.FromSeconds(delayInSeconds));
                }
            }

            if (retries == maxRetries)
            {
                throw new Exception("Failed to connect to Elasticsearch after multiple retries.");
            }


            // Check if the index already exists
            var indexExistsResponse = await elasticClient.Indices.ExistsAsync(indexName);
            if (indexExistsResponse.Exists)
            {
                Console.WriteLine($"Index {indexName} already exists.");
            }
            else
            {
                // Create the index
                var createIndexResponse = await elasticClient.Indices.CreateAsync(indexName, c => c
                    .Map<JobPost>(m => m
                        .Properties(p => p
                            .Keyword(k => k.Name(n => n.Id))
                            .Text(t => t.Name(n => n.Title).Analyzer("standard"))
                            .Text(t => t.Name(n => n.Description).Analyzer("standard"))
                            .Keyword(k => k.Name(n => n.Employer))
                            .Date(d => d.Name(n => n.CreatedAt))
                            .Date(d => d.Name(n => n.UpdatedAt))
                            .Number(n => n.Name(n => n.PaymentAmount).Type(NumberType.Integer))
                            .Date(d => d.Name(n => n.Deadline))
                            .Keyword(k => k.Name(n => n.Status))
                            .Keyword(k => k.Name(n => n.Category))
                            .Object<Location>(o => o
                                .Name(n => n.Location)
                                .Properties(lp => lp
                                    .Keyword(k => k.Name(n => n.Country))
                                    .Keyword(k => k.Name(n => n.City))
                                    .Keyword(k => k.Name(n => n.District))
                                    .Keyword(k => k.Name(n => n.Street))
                                    .Number(n => n.Name(n => n.Latitude).Type(NumberType.Double))
                                    .Number(n => n.Name(n => n.Longitude).Type(NumberType.Double))
                                )
                            )
                        )
                    )
                );
                if (!createIndexResponse.IsValid)
                {
                    Console.WriteLine($"Failed to create index: {createIndexResponse.DebugInformation}");
                    throw new Exception($"Failed to create index: {createIndexResponse.ServerError?.Error?.Reason}");
                }

                Console.WriteLine($"Index {indexName} created successfully.");
            }



            var jobPosts = await httpClient.GetJobPostsForSearchDb();

            if (jobPosts != null && jobPosts.Any())
            {
                var bulkResponse = await elasticClient.BulkAsync(b => b
                    .Index("jobposts")
                    .IndexMany(jobPosts, (d, jobPost) => d.Id(jobPost.Id))
                );

                if (bulkResponse.Errors)
                {
                    // Some items actually failed; log them:
                    foreach (var itemWithError in bulkResponse.ItemsWithErrors)
                    {
                        Console.WriteLine($"Failed to index document {itemWithError.Id}: {itemWithError.Error.Reason}");
                    }
                    throw new Exception("Some bulk items failed.");
                }
                else
                {
                    // No errors at the item level
                    Console.WriteLine($"Indexed {bulkResponse.Items.Count} documents successfully.");
                }
            }
            else
            {
                Console.WriteLine("No job posts available to populate the index.");
            }
        }
    }
}
