using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Entities;

namespace ApplyingService.Models;

public class JobPost : Entity
{
    public DateTime Deadline { get; set; }
    public string Employer { get; set; }
    public bool Finished { get; set; }
}