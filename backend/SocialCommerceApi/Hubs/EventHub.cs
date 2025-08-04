using Microsoft.AspNetCore.SignalR;

namespace SocialCommerceApi.Hubs
{
    public class EventsHub : Hub
    {
        private readonly ILogger<EventsHub> _logger;

        public EventsHub(ILogger<EventsHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _logger.LogInformation($"Client {Context.ConnectionId} joined group {groupName}");
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            _logger.LogInformation($"Client {Context.ConnectionId} left group {groupName}");
        }
    }
}