namespace ApplyingService.DTOs
{
    public class JobPostRequestDto
    {
        public string Id { get; set; }
        public string JobPostId { get; set; }
        public string Employee { get; set; }
        public DateTime ApplyDate { get; set; }
        public string Status { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Message { get; set; }
    }
}