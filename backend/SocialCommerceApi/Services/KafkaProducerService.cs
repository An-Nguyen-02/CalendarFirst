using Confluent.Kafka;
using System.Text.Json;
using SocialCommerceApi.Models;

namespace SocialCommerceApi.Services
{
    public class KafkaProducerService
    {
        private readonly IProducer<string, string> _producer;
        private readonly ILogger<KafkaProducerService> _logger;

        public KafkaProducerService(IConfiguration configuration, ILogger<KafkaProducerService> logger)
        {
            _logger = logger;
            var config = new ProducerConfig
            {
                BootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092",
                MessageTimeoutMs = 3000,
                RequestTimeoutMs = 3000
            };
            _producer = new ProducerBuilder<string, string>(config).Build();
        }

        public async Task PublishEventAsync<T>(string topic, string key, T eventData)
        {
            try
            {
                var message = new Message<string, string>
                {
                    Key = key,
                    Value = JsonSerializer.Serialize(eventData),
                    Timestamp = Timestamp.Default
                };

                var result = await _producer.ProduceAsync(topic, message);
                _logger.LogInformation($"Event published to {topic}: Partition {result.Partition}, Offset {result.Offset}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error publishing to {topic}");
                throw;
            }
        }

        public void Dispose()
        {
            _producer?.Dispose();
        }
    }
}