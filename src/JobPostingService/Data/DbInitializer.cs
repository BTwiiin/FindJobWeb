using JobPostingService.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobPostingService.Data
{
    public class DbInitializer
    {
        public static void InitDb(WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            
            SeedData(scope.ServiceProvider.GetService<JobPostingDbContext>());
        }

        private static void SeedData(JobPostingDbContext context)
        {
            context.Database.Migrate();

            if(context.JobPosts.Any())
            {
                Console.WriteLine("Database already seeded");
                return;
            }

            var jobposts = new List<JobPost>()
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
                    Category = Category.EngineeringSystems,
                    Location = new Location
                    {
                        City = "Warsaw",
                        District = "Mokotów",
                        Street = "Puławska 145",
                        Latitude = 52.193,
                        Longitude = 21.035
                    }
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
                    Category = Category.GeneralConstruction,
                    Location = new Location
                    {
                        City = "Warsaw",
                        District = "Śródmieście",
                        Street = "Marszałkowska 55",
                        Latitude = 52.229,
                        Longitude = 21.011
                    }
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
                    Category = Category.ProjectManagementConsulting,
                    Location = new Location
                    {
                        City = "Warsaw",
                        District = "Praga-Południe",
                        Street = "Grochowska 45",
                        Latitude = 52.243,
                        Longitude = 21.078
                    }
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
                    Category = Category.ArchitecturalDesign,
                    Location = new Location
                    {
                        City = "Warsaw",
                        District = "Wola",
                        Street = "Żelazna 50",
                        Latitude = 52.238,
                        Longitude = 20.991
                    }
                },
                new JobPost
                {
                    Id = Guid.NewGuid(),
                    Title = "Math Tutoring",
                    Description = "Provide online math tutoring for high school students. Algebra and calculus proficiency required.",
                    Employer = "Jane Smith",
                    Employee = null,
                    PaymentAmount = 50,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Deadline = DateTime.UtcNow.AddDays(14),
                    Status = Status.Open,
                    Category = Category.ConstructionCostEstimation,
                    Location = new Location
                    {
                        City = "Warsaw",
                        District = "Żoliborz",
                        Street = "Słowackiego 10",
                        Latitude = 52.271,
                        Longitude = 20.982
                    }
                },
                new JobPost
                {
                    Id = Guid.NewGuid(),
                    Title = "Construction Cost Estimation",
                    Description = "Estimate construction costs for new projects. Experience with building materials and construction methods required.",
                    Employer = "BuildPro Consultants",
                    Employee = null,
                    PaymentAmount = 250,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Deadline = DateTime.UtcNow.AddDays(10),
                    Status = Status.Open,
                    Category = Category.ConstructionCostEstimation,
                    Location = new Location
                    {
                        City = "Warsaw",
                        District = "Śródmieście",
                        Street = "Marszałkowska 55",
                        Latitude = 52.229,
                        Longitude = 21.011
                    }
                },
                new JobPost
                {
                    Id = Guid.NewGuid(),
                    Title = "Technical Expertise",
                    Description = "Provide technical expertise in various projects. Experience with software development and hardware troubleshooting required.",
                    Employer = "TechCorp Solutions",
                    Employee = null,
                    PaymentAmount = 300,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Deadline = DateTime.UtcNow.AddDays(14),
                    Status = Status.Open,
                    Category = Category.TechnicalExpertise,
                    Location = new Location
                    {
                        City = "Warsaw",
                        District = "Mokotów",
                        Street = "Puławska 145",
                        Latitude = 52.193,
                        Longitude = 21.035
                    }
                },
            };

            context.AddRange(jobposts);
            context.SaveChanges();
        }
    }
}
