using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;
using SearchService.Models;
using SearchService.RequestHelpers;

namespace SearchService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<JobPost>>> SearchJobPosts([FromQuery] SearchParameters searchParams)
        {
            var query = DB.PagedSearch<JobPost, JobPost>();

            query.Sort(x => x.Descending(a => a.CreatedAt));

            if (!string.IsNullOrEmpty(searchParams.FilterBy))
            {
                query = searchParams.FilterBy.ToLower() switch
                {
                    "it" => query.Match(x => x.Category == "IT"),
                    "manuallabor" => query.Match(x => x.Category == "ManualLabor"),
                    "eventplanning" => query.Match(x => x.Category == "EventPlanning"),
                    "marketing" => query.Match(x => x.Category == "Marketing"),
                    "tutoring" => query.Match(x => x.Category == "Tutoring"),
                    "entertainment" => query.Match(x => x.Category == "Entertainment"),
                    "other" => query.Match(x => x.Category == "Other"),
                    _ => query
                };
            }

            if (!string.IsNullOrEmpty(searchParams.SearchTerm))
            {
                if (searchParams.SearchTerm.Length <= 2)
                {
                    // Match exact Category if the search term is 2 characters or less (e.g., "IT")
                    query.Match(x => x.Category.ToLower() == searchParams.SearchTerm.ToLower());
                }
                else
                {
                    // Full-text search when search term is longer
                    query.Match(Search.Full, searchParams.SearchTerm).SortByTextScore();
                }
            }

            query = searchParams.OrderBy switch
            {
                "new" => query.Sort(x => x.Descending(a => a.CreatedAt)),
                "paymentAmount" => query.Sort(x => x.Ascending(a => a.PaymentAmount)),
                _ => query.Sort(x => x.Descending(a => a.PaymentAmount))
            };

            // Set Pagination
            query.PageNumber(searchParams.PageNumber);
            query.PageSize(searchParams.PageSize);

            Console.WriteLine($"OrderBy: {searchParams.OrderBy}");

            // Execute the query
            var result = await query.ExecuteAsync();

            // Return results
            return Ok(new
            {
                result.Results,
                result.PageCount,
                result.TotalCount
            });
        }
    }
}
