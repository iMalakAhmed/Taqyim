namespace Taqyim.Api.Dtos
{
    public class MonthlyReviewStat
    {
        public string Month { get; set; } = string.Empty;
        public int ReviewCount { get; set; }
        public double AverageRating { get; set; }
    }

    public class ProductStatsDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int ReviewCount { get; set; }
        public double AverageRating { get; set; }
    }

    public class ReviewEngagementDto
    {
        public int ReviewId { get; set; }
        public int ReactionCount { get; set; }
        public string CommentSnippet { get; set; } = string.Empty;
    }

    public class ReviewerStatsDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int ReviewCount { get; set; }
        public double AverageRatingGiven { get; set; }
    }

    public class BusinessAnalyticsDto
    {
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public int FollowerCount { get; set; }
        public List<MonthlyReviewStat> MonthlyReviews { get; set; } = new();
        public List<string> MostCommonTags { get; set; } = new();
        public List<ProductStatsDto> ProductStats { get; set; } = new();
        public ReviewEngagementDto? MostLikedReview { get; set; }
        public int TotalMediaCount { get; set; }
        public Dictionary<string, int> SentimentBreakdown { get; set; } = new();
        public List<ReviewerStatsDto> TopReviewers { get; set; } = new();
    }
}
