using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace JobPostingService.Entities
{
    [Table("JobPosts")]
    public class JobPost
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Employer { get; set; }
        public string Employee { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int PaymentAmount { get; set; }
        public DateTime Deadline { get; set; }
        public Status Status { get; set; }
        public Category Category { get; set; }
        public Location Location { get; set; }
        public List<string> PhotoUrls { get; set; } = new();

        public bool HasPaymentAmount() => PaymentAmount > 0;
    }

    /*  
        I store the location fields (City, District, Latitude, Longitude) directly within the JobPost table.
        This approach avoids the complexity of additional joins or lookups,
        making it straightforward to retrieve all necessary data in a single query.
    */

    [Owned]
    public class Location
    {
        public string Country { get; set; } = "Poland";
        public string City { get; set; }
        public string District { get; set; }
        public string Street { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
