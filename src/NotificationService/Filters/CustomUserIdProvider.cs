using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace NotificationService.Filters;

public class CustomUserIdProvider : IUserIdProvider
{
    public string GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst("username")?.Value;
    }
}