namespace Contracts
{
    public class JobPostUpdated
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int PaymentAmount { get; set; }
        public DateTime Deadline { get; set; }
        public string Category { get; set; }
        public LocationDto Location { get; set; }
    }
}
