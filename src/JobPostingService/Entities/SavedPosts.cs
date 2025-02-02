using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPostingService.Entities
{
    [Table("SavedPosts")]
    public class SavedPost
    {
        [Key]
        [Column(Order = 1)]
        public string Username { get; set; }

        [Key]
        [Column(Order = 2)]
        public Guid JobPostId { get; set; }

        public DateTime SavedAt { get; set; } // Example of an additional field
    }
}