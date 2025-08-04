namespace SocialCommerceApi.Models
{
    public class UserEvent
    {
        public double Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public DateTime Timestamp { get; set; }
        public string? SessionId { get; set; }
    }
}