using Bogus;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Microsoft.EntityFrameworkCore;


public static class DbSeeder
{
        private static string HashPassword(string password)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    public static async Task SeedAsync(ApplicationDbContext context)
    {

        if (!context.Users.Any())
        {
            var userFaker = new Faker<User>()
                .RuleFor(u => u.Email, f => f.Internet.Email())
                .RuleFor(u => u.PasswordHash, f => HashPassword("test1234"))
                .RuleFor(u => u.UserName, f => f.Internet.UserName())
                .RuleFor(u => u.CreatedAt, f => f.Date.Past())
                .RuleFor(u => u.ReputationPoints, f => f.Random.Int(0, 100));

            var users = userFaker.Generate(10);
            context.Users.AddRange(users);
            await context.SaveChangesAsync();
        }

        if (!context.Businesses.Any())
        {
            var businessFaker = new Faker<Business>()
                .RuleFor(b => b.Name, f => f.Company.CompanyName())
                .RuleFor(b => b.Description, f => f.Company.CatchPhrase())
                .RuleFor(b => b.CreatedAt, f => f.Date.Past())
                .RuleFor(b => b.UserId, f => context.Users.OrderBy(_ => Guid.NewGuid()).First().UserId);

            var businesses = businessFaker.Generate(5);
            context.Businesses.AddRange(businesses);
            await context.SaveChangesAsync();
        }

        if (!context.Reviews.Any())
        {
            var reviewFaker = new Faker<Review>()
                .RuleFor(r => r.Rating, f => f.Random.Int(1, 5))
                .RuleFor(r => r.Comment, f => f.Lorem.Sentence())
                .RuleFor(r => r.CreatedAt, f => f.Date.Recent())
                .RuleFor(r => r.UserId, f => context.Users.OrderBy(_ => Guid.NewGuid()).First().UserId)
                .RuleFor(r => r.BusinessId, f => context.Businesses.OrderBy(_ => Guid.NewGuid()).First().BusinessId);

            var reviews = reviewFaker.Generate(30);
            context.Reviews.AddRange(reviews);
            await context.SaveChangesAsync();
        }

        if (!context.Reactions.Any())
        {
            var reviewIds = context.Reviews.Select(r => r.ReviewId).ToList();
            var userIds = context.Users.Select(u => u.UserId).ToList();

            var reactionFaker = new Faker<Reaction>()
                .RuleFor(r => r.UserId, f => f.PickRandom(userIds))
                .RuleFor(r => r.ReviewId, f => f.PickRandom(reviewIds))
                .RuleFor(r => r.ReactionType, f => f.PickRandom("Like", "Love", "Funny", "Angry"))
                .RuleFor(r => r.CreatedAt, f => f.Date.Recent());

            var reactions = reactionFaker.Generate(50);
            context.Reactions.AddRange(reactions);
            await context.SaveChangesAsync();
        }

                if (!context.SavedReviews.Any())
        {
            var reviewIds = context.Reviews.Select(r => r.ReviewId).ToList();
            var userIds = context.Users.Select(u => u.UserId).ToList();
            var usedPairs = new HashSet<(int userId, int reviewId)>();

            var savedReviews = new List<SavedReview>();
            var faker = new Faker();

            while (savedReviews.Count < 30)
            {
                var userId = faker.PickRandom(userIds);
                var reviewId = faker.PickRandom(reviewIds);

                if (usedPairs.Add((userId, reviewId))) // only add if it's a new pair
                {
                    savedReviews.Add(new SavedReview
                    {
                        UserId = userId,
                        ReviewId = reviewId,
                        SavedAt = faker.Date.Recent()
                    });
                }
            }

            context.SavedReviews.AddRange(savedReviews);
            await context.SaveChangesAsync();
        }


        if (!context.Connections.Any())
        {
            var userIds = context.Users.Select(u => u.UserId).ToList();

            var connections = new List<Connection>();
            foreach (var followerId in userIds)
            {
                var followees = userIds.Where(id => id != followerId).OrderBy(_ => Guid.NewGuid()).Take(3);
                foreach (var followingId in followees)
                {
                    connections.Add(new Connection
                    {
                        FollowerId = followerId,
                        FollowingId = followingId,
                        FollowerType = "User",
                        FollowingType = "User",
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            context.Connections.AddRange(connections);
            await context.SaveChangesAsync();
        }
    }
}
