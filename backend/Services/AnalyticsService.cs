using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Dtos;
using Taqyim.Api.Models;
using Taqyim.Api.Data; 

namespace Taqyim.Api.Services
{
    public class AnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BusinessAnalyticsDto?> GetAnalyticsAsync(int businessId)
        {
            var business = await _context.Businesses
                .Include(b => b.Reviews)
                .Include(b => b.Reviews)
                    .ThenInclude(r => r.Reactions)
                .Include(b => b.Reviews)
                    .ThenInclude(r => r.Media)
                .Include(b => b.Reviews)
                    .ThenInclude(r => r.User)
                .Include(b => b.Products)
                    .ThenInclude(p => p.Reviews)
                .Include(b => b.ConnectionFollowers)
                .FirstOrDefaultAsync(b => b.BusinessId == businessId && !b.IsDeleted);

            if (business == null) return null;

            var dto = new BusinessAnalyticsDto
            {
                TotalReviews = business.Reviews.Count,
                AverageRating = business.Reviews.Any() ? business.Reviews.Average(r => r.Rating) : 0,
                FollowerCount = business.ConnectionFollowers.Count,

                MonthlyReviews = business.Reviews
                    .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
                    .Select(g => new MonthlyReviewStat
                    {
                        Month = $"{g.Key.Month}/{g.Key.Year}",
                        ReviewCount = g.Count(),
                        AverageRating = g.Average(r => r.Rating)
                    })
                    .OrderBy(m => m.Month)
                    .ToList(),


                ProductStats = business.Products.Select(p => new ProductStatsDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.Name,
                    ReviewCount = p.Reviews.Count,
                    AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0
                }).ToList(),

                MostLikedReview = business.Reviews
                    .OrderByDescending(r => r.Reactions.Count)
                    .Select(r => new ReviewEngagementDto
                    {
                        ReviewId = r.ReviewId,
                        ReactionCount = r.Reactions.Count,
                        CommentSnippet = r.Comment.Length > 100
                            ? r.Comment.Substring(0, 100) + "..."
                            : r.Comment
                    })
                    .FirstOrDefault(),

                TotalMediaCount = business.Reviews.SelectMany(r => r.Media).Count(),

                SentimentBreakdown = GetSentimentCounts(business.Reviews),

                TopReviewers = business.Reviews
                    .GroupBy(r => r.User)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => new ReviewerStatsDto
                    {
                        UserId = g.Key.UserId,
                        Username = g.Key.UserName ?? "Anonymous",
                        ReviewCount = g.Count(),
                        AverageRatingGiven = g.Average(r => r.Rating)
                    }).ToList()
            };

            return dto;
        }

        private Dictionary<string, int> GetSentimentCounts(ICollection<Review> reviews)
        {
            // Naive rule-based sentiment: you can replace this with ML/NLP later
            var sentimentCounts = new Dictionary<string, int>
            {
                { "Positive", 0 },
                { "Neutral", 0 },
                { "Negative", 0 }
            };

            foreach (var review in reviews)
            {
                string comment = review.Comment.ToLower();

                if (review.Rating >= 4 || comment.Contains("great") || comment.Contains("amazing") || comment.Contains("love"))
                    sentimentCounts["Positive"]++;
                else if (review.Rating == 3 || comment.Contains("okay") || comment.Contains("fine"))
                    sentimentCounts["Neutral"]++;
                else
                    sentimentCounts["Negative"]++;
            }

            return sentimentCounts;
        }
    }
}
