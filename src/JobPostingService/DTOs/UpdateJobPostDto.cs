using JobPostingService.Entities;
using System.ComponentModel.DataAnnotations;

namespace JobPostingService.DTOs
{
   public class UpdateJobPostDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int? PaymentAmount { get; set; }
        public DateTime? Deadline { get; set; }
        public string Category { get; set; }
        public LocationDto Location { get; set; }
    }

}
