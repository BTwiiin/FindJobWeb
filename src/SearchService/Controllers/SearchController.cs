using Microsoft.AspNetCore.Mvc;
using Nest;
using SearchService.Models;
using SearchService.Repository;
using SearchService.RequestHelpers;

namespace SearchService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly IElasticRepository<JobPost> _repository;

        public SearchController(IElasticRepository<JobPost> repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult> SearchJobPosts([FromQuery] SearchParameters searchParams)
        {
            var searchRequest = new SearchRequest<JobPost>("jobposts")
            {
                From = (searchParams.PageNumber - 1) * searchParams.PageSize,
                Size = searchParams.PageSize,
                Sort = GetSortCriteria(searchParams.OrderBy),
                Query = GetSearchQuery(searchParams)
            };

            var response = await _repository.SearchAsync(searchRequest);

            if (!response.IsValid)
            {
                return BadRequest(new { error = response.ServerError?.Error?.Reason });
            }

            return Ok(new
            {
                Results = response.Documents,
                PageCount = (int)Math.Ceiling((double)response.Total / searchParams.PageSize),
                TotalCount = response.Total
            });
        }

        private static QueryContainer GetSearchQuery(SearchParameters searchParams)
        {
            var query = new QueryContainer();

            if (!string.IsNullOrEmpty(searchParams.SearchTerm))
            {
                var multiMatch = new MultiMatchQuery
                {
                    Fields = new[] { "title^3", "description", "category", "location.country", "location.city", "location.district", "location.street" },
                    Query = searchParams.SearchTerm,
                    Fuzziness = Fuzziness.Auto,
                    Operator = Operator.Or
                };

                query &= multiMatch;
            }

            if (!string.IsNullOrEmpty(searchParams.FilterBy))
            {
                query &= new TermQuery
                {
                    Field = "category",
                    Value = searchParams.FilterBy
                };
            }

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

        private static IList<ISort> GetSortCriteria(string orderBy)
        {
            return orderBy switch
            {
                "new" => new List<ISort> { new FieldSort { Field = "createdAt", Order = SortOrder.Descending } },
                "paymentAmount" => new List<ISort> { new FieldSort { Field = "paymentAmount", Order = SortOrder.Descending } },
                _ => new List<ISort> { new FieldSort { Field = "createdAt", Order = SortOrder.Descending } }
            };
        }
    }
}
