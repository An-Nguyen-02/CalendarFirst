using Microsoft.AspNetCore.Mvc;
using SocialCommerceApi.Models;
using SocialCommerceApi.Services;

namespace SocialCommerceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly KafkaProducerService _kafkaProducer;
        private readonly ILogger<EventsController> _logger;

        public EventsController(KafkaProducerService kafkaProducer, ILogger<EventsController> logger)
        {
            _kafkaProducer = kafkaProducer;
            _logger = logger;
        }

        [HttpPost("user-event")]
        public async Task<IActionResult> PublishUserEvent([FromBody] UserEvent userEvent)
        {
            try
            {
                _logger.LogInformation($"Publishing user event: {userEvent.Type} for user {userEvent.UserId}");
                await _kafkaProducer.PublishEventAsync("user-events", userEvent.UserId.ToString(), userEvent);
                
                // Auto-generate related events for purchases
                if (userEvent.Type == "purchase")
                {
                    var notification = new Notification
                    {
                        Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                        Message = $"🎉 User {userEvent.UserId} purchased product {userEvent.ProductId}!",
                        Timestamp = DateTime.UtcNow,
                        Type = "purchase",
                        Read = false
                    };
                    
                    await _kafkaProducer.PublishEventAsync("notifications", userEvent.UserId.ToString(), notification);
                    
                    // Update inventory
                    var inventoryUpdate = new InventoryUpdate
                    {
                        ProductId = userEvent.ProductId,
                        NewStock = -1, // Decrease by 1
                        Timestamp = DateTime.UtcNow
                    };
                    
                    await _kafkaProducer.PublishEventAsync("inventory-updates", userEvent.ProductId.ToString(), inventoryUpdate);
                }
                
                return Ok(new { message = "Event published successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing user event");
                return StatusCode(500, new { error = "Failed to publish event" });
            }
        }

        [HttpPost("inventory-update")]
        public async Task<IActionResult> PublishInventoryUpdate([FromBody] InventoryUpdate update)
        {
            try
            {
                _logger.LogInformation($"Publishing inventory update for product {update.ProductId}");
                await _kafkaProducer.PublishEventAsync("inventory-updates", update.ProductId.ToString(), update);
                return Ok(new { message = "Inventory update published successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing inventory update");
                return StatusCode(500, new { error = "Failed to publish inventory update" });
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }
    }
}