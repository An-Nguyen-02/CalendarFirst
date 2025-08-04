namespace SocialCommerceApi.Models
{
    public class InventoryUpdate
    {
        public int ProductId { get; set; }
        public int NewStock { get; set; }
        public DateTime Timestamp { get; set; }
    }
}