namespace JobPostingService.Entities
{
    [Table("SavedPosts")]
    public class SavedPost
    {
        public string Username { get; set; }
        public Guid JobPostId { get; set; }
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}