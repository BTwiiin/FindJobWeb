using JobPostingService.Entities;
using System.ComponentModel.DataAnnotations;

namespace JobPostingService.DTOs
{
    public class CreateJobPostDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public int PaymentAmount { get; set; }
        [Required]
        public DateTime Deadline { get; set; }
        [Required]
        public string Category { get; set; }
    }
}
