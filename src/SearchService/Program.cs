using Polly;
using Polly.Extensions.Http;
using MassTransit;
using SearchService.Data;
using SearchService.Services;
using SearchService.Consumers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddHttpClient<JobPostingSvcHttpClient>().AddPolicyHandler(GetPolicy());

builder.Services.AddMassTransit(x =>
{
    x.AddConsumersFromNamespaceContaining<JobPostCreatedConsumer>();

    x.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter("search-service", false));

    x.UsingRabbitMq((context, cfg) =>
    {   
        cfg.ReceiveEndpoint("job-post-created", e =>
        {
            e.UseMessageRetry(r => r.Interval(5, 5));
            e.ConfigureConsumer<JobPostCreatedConsumer>(context);
        });

        cfg.ConfigureEndpoints(context);
    });
});

var app = builder.Build();

app.UseAuthorization();

app.MapControllers();

app.Lifetime.ApplicationStarted.Register(async () =>
{
    try
    {
        await DbInitializer.InitDb(app);
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.Message);
        throw;
    }
});

app.Run();


static IAsyncPolicy<HttpResponseMessage> GetPolicy() 
     => HttpPolicyExtensions
        .HandleTransientHttpError()
        .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
        .WaitAndRetryForeverAsync(_ => TimeSpan.FromSeconds(3));