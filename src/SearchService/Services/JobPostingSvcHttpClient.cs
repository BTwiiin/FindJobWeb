﻿using MongoDB.Entities;
using SearchService.Models;

namespace SearchService.Services
{
    public class JobPostingSvcHttpClient
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public JobPostingSvcHttpClient(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<List<JobPost>> GetJobPostsForSearchDb()
        {
            var lastUpdated = await DB.Find<JobPost, string>()
                .Sort(x => x.Descending(x => x.PaymentAmount))
                .Project(x => x.UpdatedAt.ToString())
                .ExecuteFirstAsync();
            return await _httpClient.GetFromJsonAsync<List<JobPost>>(
                $"{_config["JobPostingServiceUrl"]}/api/jobpost?date={lastUpdated}");
        }
    }
}
