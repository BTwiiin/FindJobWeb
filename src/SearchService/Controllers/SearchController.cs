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

            // Filter by category
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

            // Full-text search by search term
            if (!string.IsNullOrEmpty(searchParams.SearchTerm))
            {
                if (searchParams.SearchTerm.Length <= 2)
                {
                    query.Match(x => x.Category.ToLower() == searchParams.SearchTerm.ToLower());
                }
                else
                {
                    query.Match(Search.Full, searchParams.SearchTerm).SortByTextScore();
                }
            }

            // Filter by salary range
            if (searchParams.MinSalary.HasValue || searchParams.MaxSalary.HasValue)
            {
                query = query.Match(x =>
                    (!searchParams.MinSalary.HasValue || x.PaymentAmount >= searchParams.MinSalary.Value) &&
                    (!searchParams.MaxSalary.HasValue || x.PaymentAmount <= searchParams.MaxSalary.Value)
                );
            }

            // Sort by order
            query = searchParams.OrderBy switch
            {
                "new" => query.Sort(x => x.Descending(a => a.CreatedAt)),
                "paymentAmount" => query.Sort(x => x.Descending(a => a.PaymentAmount)),
                _ => query.Sort(x => x.Descending(a => a.CreatedAt))
            };

            // Set Pagination
            query.PageNumber(searchParams.PageNumber);
            query.PageSize(searchParams.PageSize);

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
