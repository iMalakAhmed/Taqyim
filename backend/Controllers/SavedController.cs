using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.DTOs;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SavedController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SavedController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /api/saved
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewDTO>>> GetSavedReviews([FromQuery] bool includeDetails = false)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var query = _context.SavedReviews
            .Include(s => s.Review)
                .ThenInclude(r => r!.User)
            .Include(s => s.Review)
                .ThenInclude(r => r!.Business)
            .Include(s => s.Review)
                .ThenInclude(r => r!.ReviewImages)
            .Where(s => s.UserId == userId);

        if (includeDetails)
        {
            query = query
                .Include(s => s.Review)
                    .ThenInclude(r => r!.Comments)
                        .ThenInclude(c => c.Commenter)
                .Include(s => s.Review)
                    .ThenInclude(r => r!.Reactions)
                        .ThenInclude(re => re.User)
                .Include(s => s.Review)
                    .ThenInclude(r => r!.Tags);
        }

        var savedReviews = await query
            .Select(s => new ReviewDTO
            {
                ReviewId = s.Review!.ReviewId,
                UserId = s.Review.UserId,
                BusinessId = s.Review.BusinessId,
                Rating = s.Review.Rating,
                Comment = s.Review.Comment,
                CreatedAt = s.Review.CreatedAt,
                UpdatedAt = s.Review.UpdatedAt,
                SavedAt = s.SavedAt,
                ProductId = s.Review.ProductId,
                User = new UserDTO
                {
                    UserId = s.Review.User!.UserId,
                    Email = s.Review.User.Email,
                    UserName = s.Review.User.UserName,
                    Type = s.Review.User.Type,
                    IsVerified = s.Review.User.IsVerified,
                    ProfilePic = s.Review.User.ProfilePic,
                    Bio = s.Review.User.Bio,
                    CreatedAt = s.Review.User.CreatedAt,
                    ReputationPoints = s.Review.User.ReputationPoints
                },
                Business = new BusinessDTO
                {
                    BusinessId = s.Review.Business!.BusinessId,
                    Name = s.Review.Business.Name,
                    Category = s.Review.Business.Category,
                    Description = s.Review.Business.Description,

                    CreatedAt = s.Review.Business.CreatedAt,
                    BusinessLocations = new List<BusinessLocationDTO>()
                },
                Images = s.Review.ReviewImages.Select(i => new ReviewImageDTO
                {
                    ReviewImageId = i.ReviewImageId,
                    ReviewId = i.ReviewId,
                    ImageUrl = i.ImageUrl,
                    Caption = i.Caption,
                    CreatedAt = i.CreatedAt,
                    Order = i.Order
                }).ToList(),
                Comments = includeDetails ? s.Review.Comments.Select(c => new CommentDTO
                {
                    CommentId = c.CommentId,
                    CommenterId = c.CommenterId,
                    ReviewId = c.ReviewId,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt ?? DateTime.UtcNow,
                    Commenter = new UserDTO
                    {
                        UserId = c.Commenter!.UserId,
                        Email = c.Commenter.Email,
                        UserName = c.Commenter.UserName,
                        Type = c.Commenter.Type,
                        IsVerified = c.Commenter.IsVerified,
                        ProfilePic = c.Commenter.ProfilePic,
                        Bio = c.Commenter.Bio,
                        CreatedAt = c.Commenter.CreatedAt,
                        ReputationPoints = c.Commenter.ReputationPoints
                    }
                }).ToList() : new List<CommentDTO>(),
                Reactions = includeDetails ? s.Review.Reactions.Select(re => new ReactionDTO
                {
                    ReactionId = re.ReactionId,
                    ReviewId = re.ReviewId,
                    UserId = re.UserId,
                    ReactionType = re.ReactionType ?? string.Empty,
                    CreatedAt = re.CreatedAt ?? DateTime.UtcNow,
                    User = new UserDTO
                    {
                        UserId = re.User!.UserId,
                        Email = re.User.Email,
                        UserName = re.User.UserName,
                        Type = re.User.Type,
                        IsVerified = re.User.IsVerified,
                        ProfilePic = re.User.ProfilePic,
                        Bio = re.User.Bio,
                        CreatedAt = re.User.CreatedAt,
                        ReputationPoints = re.User.ReputationPoints
                    }
                }).ToList() : new List<ReactionDTO>(),
                Tags = includeDetails ? s.Review.Tags.Select(t => new TagDTO
                {
                    TagId = t.TagId,
                    TagType = t.TagType,
                    ReviewId = t.ReviewId
                }).ToList() : new List<TagDTO>(),
                Product = s.Review.Product == null ? null : new ProductDTO
                {
                    ProductId = s.Review.Product.ProductId,
                    Name = s.Review.Product.Name,
                    Description = s.Review.Product.Description
                }
            })
            .ToListAsync();

        return savedReviews;
    }

    // POST: /api/saved/{reviewId}
    [Authorize]
    [HttpPost("{reviewId}")]
    public async Task<IActionResult> SaveReview(int reviewId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var review = await _context.Reviews.FindAsync(reviewId);

        if (review == null)
            return NotFound("Review not found");

        var existingSaved = await _context.SavedReviews
            .FirstOrDefaultAsync(s => s.UserId == userId && s.ReviewId == reviewId);

        if (existingSaved != null)
            return BadRequest("Review already saved");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound("User not found");

        var savedReview = new SavedReview
        {
            UserId = userId,
            ReviewId = reviewId,
            SavedAt = DateTime.UtcNow,
            User = user,
            Review = review
        };

        _context.SavedReviews.Add(savedReview);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: /api/saved/{reviewId}
    [Authorize]
    [HttpDelete("{reviewId}")]
    public async Task<IActionResult> UnsaveReview(int reviewId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var savedReview = await _context.SavedReviews
            .FirstOrDefaultAsync(s => s.UserId == userId && s.ReviewId == reviewId);

        if (savedReview == null)
            return NotFound();

        _context.SavedReviews.Remove(savedReview);
        await _context.SaveChangesAsync();

        return NoContent();
    }
} 