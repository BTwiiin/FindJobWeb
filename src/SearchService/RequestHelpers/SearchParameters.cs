namespace SearchService.RequestHelpers
{
    public class SearchParameters
    {
        public string SearchTerm { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 100;
        public string OrderBy { get; set; }
        public string FilterBy { get; set; }
        public int? MinSalary { get; set; }
        public int? MaxSalary { get; set; }
    }
}
