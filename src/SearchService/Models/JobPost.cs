namespace SearchService.Models
{
    public class JobPost
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Employer { get; set; }
        public string Employee { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int PaymentAmount { get; set; }
        public DateTime Deadline { get; set; }
        public string Status { get; set; }
        public string Category { get; set; }
        public Location Location { get; set; }
    }

    public class Location
    {
        public string Country { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string Street { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

}
