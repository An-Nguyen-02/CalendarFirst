using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using SocialCommerceApi.Models;
using SocialCommerceApi.Hubs;

namespace SocialCommerceApi.Services
{
    public class KafkaConsumerService : BackgroundService
    {
        private readonly IConsumer<string, string> _consumer;
        private readonly IHubContext<EventsHub> _hubContext;
        private readonly ILogger<KafkaConsumerService> _logger;

        public KafkaConsumerService(IConfiguration configuration, 
                                   IHubContext<EventsHub> hubContext,
                                   ILogger<KafkaConsumerService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;

            var config = new ConsumerConfig
            {
                BootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092",
                GroupId = "social-commerce-group",
                AutoOffsetReset = AutoOffsetReset.Latest,
                EnableAutoCommit = true,
                SessionTimeoutMs = 6000,
                HeartbeatIntervalMs = 3000
            };

            _consumer = new ConsumerBuilder<string, string>(config).Build();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _consumer.Subscribe(new[] { "user-events", "inventory-updates", "notifications" });
            _logger.LogInformation("Kafka consumer started. Subscribed to topics: user-events, inventory-updates, notifications");

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = _consumer.Consume(TimeSpan.FromMilliseconds(1000));
                        
                        if (consumeResult?.Message?.Value != null)
                        {
                            _logger.LogInformation($"Received message from topic {consumeResult.Topic}");
                            await ProcessMessage(consumeResult.Topic, consumeResult.Message.Value);
                        }
                    }
                    catch (ConsumeException ex)
                    {
                        _logger.LogError(ex, "Error consuming message from Kafka");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Kafka consumer");
            }
            finally
            {
                _consumer.Close();
                _logger.LogInformation("Kafka consumer stopped");
            }
        }

        private async Task ProcessMessage(string topic, string message)
        {
            try
            {
                switch (topic)
                {
                    case "user-events":
                        var userEvent = JsonSerializer.Deserialize<UserEvent>(message);
                        if (userEvent != null)
                        {
                            await _hubContext.Clients.All.SendAsync("NewUserEvent", userEvent);
                            _logger.LogInformation($"Broadcasted user event: {userEvent.Type}");
                        }
                        break;

                    case "notifications":
                        var notification = JsonSerializer.Deserialize<Notification>(message);
                        if (notification != null)
                        {
                            await _hubContext.Clients.All.SendAsync("NewNotification", notification);
                            _logger.LogInformation($"Broadcasted notification: {notification.Type}");
                        }
                        break;

                    case "inventory-updates":
                        var inventoryUpdate = JsonSerializer.Deserialize<InventoryUpdate>(message);
                        if (inventoryUpdate != null)
                        {
                            await _hubContext.Clients.All.SendAsync("InventoryUpdate", inventoryUpdate);
                            _logger.LogInformation($"Broadcasted inventory update for product: {inventoryUpdate.ProductId}");
                        }
                        break;

                    default:
                        _logger.LogWarning($"Unknown topic: {topic}");
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing message from {topic}: {message}");
            }
        }

        public override void Dispose()
        {
            _consumer?.Dispose();
            base.Dispose();
        }
    }
}