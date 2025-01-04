using Nest;

namespace SearchService.Services
{
    public class ElasticClientProvider
    {
        private readonly IElasticClient _client;

        public ElasticClientProvider(string elasticsearchUrl)
        {
            var settings = new ConnectionSettings(new Uri(elasticsearchUrl))
                .DefaultIndex("jobposts");
            _client = new ElasticClient(settings);
        }

        public IElasticClient GetClient() => _client;
    }
}