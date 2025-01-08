using Polly;
using Polly.Extensions.Http;
using MassTransit;
using SearchService.Data;
using SearchService.Services;
using SearchService.Consumers;
using Nest;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddHttpClient<JobPostingSvcHttpClient>().AddPolicyHandler(GetPolicy());

builder.Services.AddSingleton<IElasticClient>(provider =>
{
    var config = builder.Configuration;
    var url = config.GetConnectionString("ElasticsearchURL");

    var settings = new ConnectionSettings(new Uri(url))
        .DisableDirectStreaming()
        .EnableHttpCompression()
        .PrettyJson()
        .DefaultIndex("jobposts");
        
        #if DEV
            settings.EnableDebugMode();
        #endif

    Console.WriteLine($"Elasticsearch URL: {url}");
    

    return new ElasticClient(settings);
});


builder.Services.AddMassTransit(x =>
{
    x.AddConsumersFromNamespaceContaining<JobPostCreatedConsumer>();

    x.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter("search-service", false));

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"], "/", host =>
        {
            host.Username(builder.Configuration.GetValue("RabbitMq:Username", "guest"));
            host.Password(builder.Configuration.GetValue("RabbitMq:Password", "guest"));
        });

        cfg.ReceiveEndpoint("job-post-created", e =>
        {
            e.UseMessageRetry(r => r.Interval(5, 5));
            e.ConfigureConsumer<JobPostCreatedConsumer>(context);
            e.ConfigureConsumer<JobPostUpdatedConsumer>(context);
            e.ConfigureConsumer<JobPostDeletedConsumer>(context);
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