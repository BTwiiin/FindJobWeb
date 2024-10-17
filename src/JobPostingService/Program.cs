using JobPostingService.Data;
using JobPostingService.Repository;
using MassTransit;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddMassTransit(x =>
{
    x.AddEntityFrameworkOutbox<JobPostingDbContext>(o =>
    {
        o.QueryDelay = TimeSpan.FromSeconds(10);
        o.UsePostgres();
        o.UseBusOutbox();
    });

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddDbContext<JobPostingDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IJobPostRepository, JobPostRepository>();

var app = builder.Build();

app.UseAuthentication();

app.MapControllers();

try
{
    DbInitializer.InitDb(app);
}
catch (Exception ex)
{
    Console.WriteLine(ex.Message);
}

app.Run();
