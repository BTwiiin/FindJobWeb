using MongoDB.Entities;

namespace ApplyingService.Models
{
    public class JobPostRequest : Entity
    {
        public string JobPostId { get; set; }
        public string Employee { get; set; }
        public DateTime ApplyDate { get; set; } = DateTime.Now;
        public Status Status { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Message { get; set; }
    }
}