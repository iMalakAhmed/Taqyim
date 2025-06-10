using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.Models;

namespace Taqyim.Api.Services
{
    public class RecommendationRow
    {
        public int UserId { get; set; }
        public int ItemId { get; set; }
        public string ItemType { get; set; } = string.Empty; // Business, User, Review
        public float Score { get; set; }
    }

    public class RecommendationDataService
    {
        private readonly ApplicationDbContext _context;

        public RecommendationDataService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<RecommendationRow>> GenerateBusinessScores(int userId)
        {
            var userReviews = await _context.Reviews
                .Where(r => r.UserId == userId)
                .ToListAsync();

            var reviewedBusinessScores = userReviews
                .Select(r => new RecommendationRow
                {
                    UserId = userId,
                    ItemId = r.BusinessId,
                    ItemType = "Business",
                    Score = r.Rating
                })
                .ToList();

            var followedBusinesses = await _context.Connections
                .Where(c => c.FollowerId == userId && c.FollowingType == "Business")
                .Select(c => c.BusinessFollowingId)
                .ToListAsync();

            var followedScores = followedBusinesses
                .Where(id => id.HasValue)
                .Select(bid => new RecommendationRow
                {
                    UserId = userId,
                    ItemId = bid.Value,
                    ItemType = "Business",
                    Score = 1.0f
                });

            return reviewedBusinessScores.Concat(followedScores).ToList();
        }

        public async Task<List<RecommendationRow>> GenerateUserScores(int userId)
        {
            var followedUsers = await _context.Connections
                .Where(c => c.FollowerId == userId && c.FollowingType == "User")
                .Select(c => c.FollowingId)
                .ToListAsync();

            return followedUsers
                .Where(uid => uid.HasValue)
                .Select(uid => new RecommendationRow
                {
                    UserId = userId,
                    ItemId = uid.Value,
                    ItemType = "User",
                    Score = 1.0f
                }).ToList();
        }

        public async Task<List<RecommendationRow>> GenerateReviewScores(int userId)
        {
            var reactions = await _context.Reactions
                .Where(r => r.UserId == userId)
                .Select(r => r.ReviewId)
                .ToListAsync();

            var saved = await _context.SavedReviews
                .Where(s => s.UserId == userId)
                .Select(s => s.ReviewId)
                .ToListAsync();

            var comments = await _context.Comments
                .Where(c => c.CommenterId == userId)
                .Select(c => c.ReviewId)
                .ToListAsync();

            var rows = new List<RecommendationRow>();

            rows.AddRange(reactions.Select(rid => new RecommendationRow { UserId = userId, ItemId = rid, ItemType = "Review", Score = 0.8f }));
            rows.AddRange(saved.Select(rid => new RecommendationRow { UserId = userId, ItemId = rid, ItemType = "Review", Score = 0.7f }));
            rows.AddRange(comments.Select(rid => new RecommendationRow { UserId = userId, ItemId = rid, ItemType = "Review", Score = 0.6f }));

            return rows;
        }

        public async Task<List<RecommendationRow>> GenerateAllUserData(int userId)
        {
            var businessScores = await GenerateBusinessScores(userId);
            var userScores = await GenerateUserScores(userId);
            var reviewScores = await GenerateReviewScores(userId);

            return businessScores
                .Concat(userScores)
                .Concat(reviewScores)
                .ToList();
        }

        public async Task ExportToCsv(List<RecommendationRow> rows, string filePath)
        {
            using var writer = new StreamWriter(filePath);
            await writer.WriteLineAsync("user_id,item_id,item_type,score");
            foreach (var row in rows)
            {
                await writer.WriteLineAsync($"{row.UserId},{row.ItemId},{row.ItemType},{row.Score}");
            }
        }
    }
}
