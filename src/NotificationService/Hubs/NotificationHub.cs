using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Hubs;

public class NotificationHub : Hub
{
    // Mapping from userId to connection IDs (for multiple device support)
    private static readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();

    public override Task OnConnectedAsync()
    {
        string userId = Context.UserIdentifier;
        Console.WriteLine($"--> User connected: {userId} with ConnectionId: {Context.ConnectionId}");
        
        if (!string.IsNullOrEmpty(userId))
        {
            _userConnections.AddOrUpdate(userId, 
                _ => new HashSet<string> { Context.ConnectionId }, 
                (_, connections) => { connections.Add(Context.ConnectionId); return connections; }
            );
        }

        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception exception)
    {
        string userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId) && _userConnections.ContainsKey(userId))
        {
            _userConnections[userId].Remove(Context.ConnectionId);
            if (_userConnections[userId].Count == 0)
            {
                _userConnections.TryRemove(userId, out _);
            }
        }

        return base.OnDisconnectedAsync(exception);
    }

    public static IReadOnlyCollection<string> GetUserConnections(string userId) =>
        _userConnections.TryGetValue(userId, out var connections) ? connections : new HashSet<string>();
}