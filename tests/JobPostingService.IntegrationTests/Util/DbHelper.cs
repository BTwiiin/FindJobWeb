using JobPostingService.Data;
using JobPostingService.Entities;

namespace JobPostingService.IntegrationTests;

public static class DbHelper
{
    public static void InitDbForTests(JobPostingDbContext context)
    {
        context.JobPosts.AddRange(GetJobPostsForTest());
        context.SaveChanges();
    }

    public static void ReinitDbForTests(JobPostingDbContext context)
    {
        context.JobPosts.RemoveRange(context.JobPosts);
        context.SaveChanges();
        InitDbForTests(context);
    }

    private static List<JobPost> GetJobPostsForTest()
    {
        return new List<JobPost>
        {
            new JobPost
            {
                Id = Guid.NewGuid(),
                Title = "Website Bug Fixes",
                Description = "Fix bugs on the company website. Requires proficiency in HTML, CSS, and JavaScript.",
                Employer = "TechCorp Solutions",
                Employee = null,
                PaymentAmount = 200,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Deadline = DateTime.UtcNow.AddDays(7),
                Status = Status.Open,
                Category = Category.IT
            },
            new JobPost
            {
                Id = Guid.NewGuid(),
                Title = "Moving Assistance",
                Description = "Help move furniture to a new apartment. Must be able to lift heavy objects.",
                Employer = "John Doe",
                Employee = null,
                PaymentAmount = 100,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Deadline = DateTime.UtcNow.AddDays(3),
                Status = Status.Open,
                Category = Category.ManualLabor
            },
            new JobPost
            {
                Id = Guid.NewGuid(),
                Title = "Event Setup Crew",
                Description = "Help set up tables, chairs, and decorations for a corporate event.",
                Employer = "Events by Sarah",
                Employee = null,
                PaymentAmount = 150,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Deadline = DateTime.UtcNow.AddDays(5),
                Status = Status.Open,
                Category = Category.EventPlanning
            },
            new JobPost
            {
                Id = Guid.NewGuid(),
                Title = "Social Media Marketing",
                Description = "Create and manage social media posts for our brand. Experience with Instagram and Facebook required.",
                Employer = "GreenLeaf Marketing",
                Employee = null,
                PaymentAmount = 300,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Deadline = DateTime.UtcNow.AddDays(10),
                Status = Status.Open,
                Category = Category.Marketing
            },
            new JobPost
            {
                Id = Guid.Parse("f5b1b3b4-3b3b-4b3b-8b3b-3b3b3b3b3b3b"),
                Title = "Math Tutoring",
                Description = "Provide online math tutoring for high school students. Algebra and calculus proficiency required.",
                Employer = "Jane Smith",
                Employee = null,
                PaymentAmount = 50,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Deadline = DateTime.UtcNow.AddDays(14),
                Status = Status.Open,
                Category = Category.Tutoring
            },
        };
    }
}