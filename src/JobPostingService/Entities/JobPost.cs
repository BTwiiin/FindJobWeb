using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;

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

        public bool HasPaymentAmount() => PaymentAmount > 0;
    }
}
