using Microsoft.AspNetCore.Mvc;
using Nest;
using SearchService.Models;
using SearchService.RequestHelpers;

namespace SearchService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly IElasticClient _elasticClient;

        public SearchController(IElasticClient elasticClient)
        {
            _elasticClient = elasticClient;
        }

        [HttpGet]
        public async Task<ActionResult> SearchJobPosts([FromQuery] SearchParameters searchParams)
        {
            // Build the search request
            var searchRequest = new SearchRequest<JobPost>("jobposts")
            {
                From = (searchParams.PageNumber - 1) * searchParams.PageSize,
                Size = searchParams.PageSize,
                Sort = GetSortCriteria(searchParams.OrderBy),
                Query = GetSearchQuery(searchParams)
            };

            // Execute the search
            var response = await _elasticClient.SearchAsync<JobPost>(searchRequest);

            // Check for errors
            if (!response.IsValid)
            {
                return BadRequest(new { error = response.ServerError?.Error?.Reason });
            }

            // Return paginated data
            return Ok(new
            {
                Results = response.Documents,
                PageCount = (int)Math.Ceiling((double)response.Total / searchParams.PageSize),
                TotalCount = response.Total
            });
        }

        /// <summary>
        /// Builds a compound query that does:
        /// 1) MultiMatch (title, description, category, and location fields) if SearchTerm is provided
        /// 2) Filters by category if FilterBy is provided
        /// 3) Numeric range filter (paymentAmount) if MinSalary/MaxSalary is provided
        /// </summary>
        private static QueryContainer GetSearchQuery(SearchParameters searchParams)
        {
            var query = new QueryContainer();

            // Multi-field full-text search (title, description, category, location.*) 
            if (!string.IsNullOrEmpty(searchParams.SearchTerm))
            {
                var multiMatch = new MultiMatchQuery
                {
                    Fields = new[]
                    {
                        "title^3",
                        "description", 
                        "category",
                        "location.country",
                        "location.city",
                        "location.district",
                        "location.street"
                    },
                    Query = searchParams.SearchTerm,
                    Fuzziness = Fuzziness.Auto,
                    Operator = Operator.Or
                };

                query &= multiMatch;
            }


            // Exact category filter (if you want to filter by the category field as a keyword)
            if (!string.IsNullOrEmpty(searchParams.FilterBy))
            {
                query &= new TermQuery
                {
                    Field = "category",
                    Value = searchParams.FilterBy
                };
            }

            // Salary range filter
            if (searchParams.MinSalary.HasValue || searchParams.MaxSalary.HasValue)
            {
                query &= new NumericRangeQuery
                {
                    Field = "paymentAmount",
                    GreaterThanOrEqualTo = searchParams.MinSalary,
                    LessThanOrEqualTo = searchParams.MaxSalary
                };
            }

            return query;
        }

        /// <summary>
        /// Supports sorting by "new" (createdAt desc) or "paymentAmount" (desc).
        /// By default, sorts by createdAt desc.
        /// </summary>
        private static IList<ISort> GetSortCriteria(string orderBy)
        {
            return orderBy switch
            {
                "new" => new List<ISort>
                {
                    new FieldSort { Field = "createdAt", Order = SortOrder.Descending }
                },
                "paymentAmount" => new List<ISort>
                {
                    new FieldSort { Field = "paymentAmount", Order = SortOrder.Descending }
                },
                _ => new List<ISort>
                {
                    new FieldSort { Field = "createdAt", Order = SortOrder.Descending }
                }
            };
        }
    }
}
