using Elasticsearch.Net;
using Microsoft.Extensions.Diagnostics.HealthChecks;
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

            await ConnectionChecks(elasticClient);

            await HealthChecks(elasticClient);

            await CreateIndexAndSeedData(elasticClient, httpClient);

            Console.WriteLine("Elasticsearch initialization completed.");

        }

        // Not the best function, since it performs 2 tasks: creating the index and seeding the data.
        private static async Task CreateIndexAndSeedData(IElasticClient elasticClient, JobPostingSvcHttpClient httpClient)
        {
            var indexName = "jobposts";
            const int batchSize = 1000;            

            var indexExistsResponse = await elasticClient.Indices.ExistsAsync(indexName);
            if (indexExistsResponse.Exists)
            {
                Console.WriteLine($"Index {indexName} already exists.");
            }
            else
            {
                var createIndexResponse = await elasticClient.Indices.CreateAsync(indexName, c => c
                    .Settings(s => s
                        .NumberOfShards(1)
                        .NumberOfReplicas(1)
                    )
                    .Map<JobPost>(m => m
                        .Properties(p => p
                            .Keyword(k => k.Name(n => n.Id))
                            .Text(t => t.Name(n => n.Title).Analyzer("standard"))
                            .Text(t => t.Name(n => n.Description).Analyzer("standard"))
                            .Keyword(k => k.Name(n => n.Employer))
                            .Date(d => d.Name(n => n.CreatedAt).Format("strict_date_optional_time"))
                            .Date(d => d.Name(n => n.UpdatedAt).Format("strict_date_optional_time"))
                            .Number(n => n.Name(n => n.PaymentAmount).Type(NumberType.Integer))
                            .Date(d => d.Name(n => n.Deadline).Format("strict_date_optional_time"))
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

            foreach (var batch in jobPosts.Chunk(batchSize))
            {
                var bulkResponse = await elasticClient.BulkAsync(b => b
                    .Index("jobposts")
                    .IndexMany(batch, (d, jobPost) => d.Id(jobPost.Id))
                );

                if (bulkResponse.Errors)
                {
                    foreach (var itemWithError in bulkResponse.ItemsWithErrors)
                    {
                        Console.WriteLine($"Failed to index document {itemWithError.Id}: {itemWithError.Error.Reason}");
                    }
                    throw new Exception("Some bulk items failed.");
                }
            }
        }

        private static async Task ConnectionChecks(IElasticClient elasticClient)
        {
            const int maxRetries = 10;
            const int delayInSeconds = 5;
            var retries = 0;

            while (retries < maxRetries)
            {
                try
                {
                    var pingResponse = await elasticClient.PingAsync();
                    if (pingResponse.IsValid)
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

        private async static Task HealthChecks(IElasticClient elasticClient)
        {
            /* 
            Replica Shards: Each index in Elasticsearch has a number of primary and replica shards.
            If there are insufficient nodes to allocate the replicas, the cluster remains yellow.
            In this case it will be Yellow because we have only one node. 
            NOTE! - Three or more nodes are recommended for production.
            */

            var healthResponse = await elasticClient.Cluster.HealthAsync();
            if (healthResponse.Status == Health.Red)
            {
                throw new Exception("Elasticsearch cluster health is red.");
            }
            else if (healthResponse.Status == Health.Yellow)
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
