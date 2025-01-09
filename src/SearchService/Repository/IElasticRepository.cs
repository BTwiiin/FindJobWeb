using System.Threading.Tasks;
using Nest;

namespace SearchService.Repository
{
    public interface IElasticRepository<T> where T : class
    {
        Task AddAsync(T entity, string indexName = null);
        Task UpdateAsync(string id, T entity, string indexName = null);
        Task DeleteAsync(string id, string indexName = null);
        Task<T> GetByIdAsync(string id, string indexName = null);
        Task<bool> IndexExistsAsync(string indexName);
        Task CreateIndexAsync(string indexName, Func<CreateIndexDescriptor, ICreateIndexRequest> selector);
        Task<bool> CheckConnectionAsync();
        Task<ClusterHealthResponse> CheckClusterHealthAsync();
        Task SeedDataAsync(string indexName, IEnumerable<T> data, int batchSize = 1000);
        Task<ISearchResponse<T>> SearchAsync(SearchRequest<T> searchRequest);
    }
}
