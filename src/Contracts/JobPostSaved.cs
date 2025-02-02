namespace Contracts
{
    public class JobPostSaved
    {
        public Guid JobPostId { get; init; }
        public string Username { get; init; }
        public DateTime SavedAt { get; init; }
    }
}