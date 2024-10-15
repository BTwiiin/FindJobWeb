using JobPostingService.Entities;

namespace JobPostingService.DTOs
{
    public class JobPostDto
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
        public string Status { get; set; }
        public string Category { get; set; }
    }
}
