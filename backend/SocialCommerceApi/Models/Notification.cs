namespace SocialCommerceApi.Models
{
    public class Notification
    {
        public long Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Type { get; set; } = string.Empty;
        public bool Read { get; set; }
    }
}