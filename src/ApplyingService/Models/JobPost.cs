using MongoDB.Entities;

namespace ApplyingService.Models;

class JobPost : Entity
{
    public string Id { get; set; }
    public DateTime Deadline { get; set; }
    public string Employer { get; set; }
    public bool Finished { get; set; }
}