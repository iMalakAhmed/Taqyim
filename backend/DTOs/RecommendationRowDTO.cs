namespace Taqyim.Api.DTOs.Recommendation;

public class RecommendationRowDTO
{
    public int UserId { get; set; }
    public int ItemId { get; set; }
    public string ItemType { get; set; } = string.Empty; 
    public float Score { get; set; }
}
