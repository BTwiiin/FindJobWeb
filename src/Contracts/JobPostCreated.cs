namespace Contracts
{
    public class JobPostCreated
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Employer { get; set; }
        public int PaymentAmount { get; set; }
        public DateTime Deadline { get; set; }
        public string Category { get; set; }
        public string Status { get; set; }
        public LocationDto Location { get; set; }
    }

    public class LocationDto
    {
        public string Country { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string Street { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
