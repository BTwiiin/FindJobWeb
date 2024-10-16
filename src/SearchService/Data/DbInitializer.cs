using MongoDB.Driver;
using MongoDB.Entities;
using SearchService.Models;
using SearchService.Services;
using System.Text.Json;

namespace SearchService.Data
{
    public class DbInitializer
    {
        public static async Task InitDb(WebApplication app)
        {
            await DB.InitAsync("SearchDb", MongoClientSettings.
                    FromConnectionString(app.Configuration.GetConnectionString("MongoDbConnection")));
            await DB.Index<JobPost>()
                .Key(p => p.Title, KeyType.Text)
                .Key(p => p.Employer, KeyType.Text)
                .Key(p => p.Status, KeyType.Text)
                .Key(p => p.Category, KeyType.Text)
                .CreateAsync();

            var count = await DB.CountAsync<JobPost>();
            
            using var scope = app.Services.CreateScope();

            var httpClient = scope.ServiceProvider.GetRequiredService<JobPostingSvcHttpClient>();

            var items = await httpClient.GetJobPostsForSearchDb();

            Console.WriteLine($"Retrieved {items.Count} items from JobPostingService");

            if (items.Count > 0) await DB.SaveAsync(items);

        }
    }
}
