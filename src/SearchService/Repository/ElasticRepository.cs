using Nest;

namespace SearchService.Repository
{
    public class ElasticRepository<T> : IElasticRepository<T> where T : class
    {
        private readonly IElasticClient _elasticClient;

        public ElasticRepository(IElasticClient elasticClient)
        {
            _elasticClient = elasticClient ?? throw new ArgumentNullException(nameof(elasticClient));
        }

        public async Task AddAsync(T entity, string indexName = null)
        {
            var response = await _elasticClient.IndexAsync(entity, idx => idx.Index(indexName));
            if (!response.IsValid)
            {
                throw new Exception($"Failed to index document: {response.OriginalException?.Message ?? "Unknown error"}");
            }
        }

        public async Task UpdateAsync(string id, T entity, string indexName = null)
        {
            var response = await _elasticClient.UpdateAsync<T>(id, u => u.Index(indexName).Doc(entity));
            if (!response.IsValid)
            {
                throw new Exception($"Failed to update document: {response.OriginalException?.Message ?? "Unknown error"}");
            }
        }

        public async Task DeleteAsync(string id, string indexName = null)
        {
            var response = await _elasticClient.DeleteAsync<T>(id, d => d.Index(indexName));
            if (!response.IsValid)
            {
                throw new Exception($"Failed to delete document: {response.OriginalException?.Message ?? "Unknown error"}");
            }
        }

        public async Task<T> GetByIdAsync(string id, string indexName = null)
        {
            var response = await _elasticClient.GetAsync<T>(id, g => g.Index(indexName));
            if (!response.IsValid || !response.Found)
            {
                throw new Exception($"Document with ID {id} not found.");
            }
            return response.Source;
        }

        public async Task<bool> IndexExistsAsync(string indexName)
        {
            var response = await _elasticClient.Indices.ExistsAsync(indexName);
            return response.Exists;
        }

        public async Task CreateIndexAsync(string indexName, Func<CreateIndexDescriptor, ICreateIndexRequest> selector)
        {
            var response = await _elasticClient.Indices.CreateAsync(indexName, selector);
            if (!response.IsValid)
            {
                throw new Exception($"Failed to create index: {response.DebugInformation}");
            }
        }

        public async Task<bool> CheckConnectionAsync()
        {
            var pingResponse = await _elasticClient.PingAsync();
            return pingResponse.IsValid;
        }

        public async Task<ClusterHealthResponse> CheckClusterHealthAsync()
        {
            return await _elasticClient.Cluster.HealthAsync();
        }

        public async Task SeedDataAsync(string indexName, IEnumerable<T> data, int batchSize = 1000)
        {
            foreach (var batch in data.Chunk(batchSize))
            {
                var bulkResponse = await _elasticClient.BulkAsync(b => b
                    .Index(indexName)
                    .IndexMany(batch));
                
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

        public async Task<ISearchResponse<T>> SearchAsync(SearchRequest<T> searchRequest)
        {
            var response = await _elasticClient.SearchAsync<T>(searchRequest);
            if (!response.IsValid)
            {
                throw new Exception($"Search failed: {response.ServerError?.Error?.Reason}");
            }

            return response;
        }
    }
}
