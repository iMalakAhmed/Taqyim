using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.DTOs;
using System.Collections.Generic;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReviewController(ApplicationDbContext context)
    {
        _context = context;
    }

    private static ReviewDTO MapReviewToDto(Review review)
    {
        return new ReviewDTO
        {
            ProductId = review.ProductId,
            ReviewId = review.ReviewId,
            UserId = review.UserId,
            BusinessId = review.BusinessId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt,
            User = review.User == null ? null : new UserDTO
            {
                UserId = review.User.UserId,
                Email = review.User.Email,
                UserName = review.User.UserName,
                Type = review.User.Type,
                IsVerified = review.User.IsVerified,
                ProfilePic = review.User.ProfilePic,
                Bio = review.User.Bio,
                CreatedAt = review.User.CreatedAt,
                ReputationPoints = review.User.ReputationPoints
            },
            Business = review.Business == null ? null : new BusinessDTO
            {
                BusinessId = review.Business.BusinessId,
                Name = review.Business.Name,
                Category = review.Business.Category,
                Description = review.Business.Description,
                CreatedAt = review.Business.CreatedAt,
                BusinessLocations = new List<BusinessLocationDTO>()
            },
            Comments = review.Comments?.Select(c => new CommentDTO
            {
                CommentId = c.CommentId,
                CommenterId = c.CommenterId,
                ReviewId = c.ReviewId,
                Content = c.Content,
                CreatedAt = c.CreatedAt ?? DateTime.UtcNow,
                Commenter = c.Commenter == null ? null : new UserDTO
                {
                    UserId = c.Commenter.UserId,
                    Email = c.Commenter.Email,
                    UserName = c.Commenter.UserName,
                    Type = c.Commenter.Type,
                    IsVerified = c.Commenter.IsVerified,
                    ProfilePic = c.Commenter.ProfilePic,
                    Bio = c.Commenter.Bio,
                    CreatedAt = c.Commenter.CreatedAt,
                    ReputationPoints = c.Commenter.ReputationPoints
                }
            }).ToList() ?? new List<CommentDTO>(),
            Reactions = review.Reactions?.Select(re => new ReactionDTO
            {
                ReactionId = re.ReactionId,
                ReviewId = re.ReviewId,
                UserId = re.UserId,
                ReactionType = re.ReactionType ?? string.Empty,
                CreatedAt = re.CreatedAt ?? DateTime.UtcNow,
                User = re.User == null ? null : new UserDTO
                {
                    UserId = re.User.UserId,
                    Email = re.User.Email,
                    UserName = re.User.UserName,
                    Type = re.User.Type,
                    IsVerified = re.User.IsVerified,
                    ProfilePic = re.User.ProfilePic,
                    Bio = re.User.Bio,
                    CreatedAt = re.User.CreatedAt,
                    ReputationPoints = re.User.ReputationPoints
                }
            }).ToList() ?? new List<ReactionDTO>(),
            Tags = review.Tags?.Select(t => new TagDTO
            {
                TagId = t.TagId,
                TagType = t.TagType,
                ReviewId = t.ReviewId
            }).ToList() ?? new List<TagDTO>(),
            Product = review.Product == null ? null : new ProductDTO
            {
                ProductId = review.Product.ProductId,
                Name = review.Product.Name,
                Description = review.Product.Description,
                IsDeleted = review.Product.IsDeleted,
                BusinessId = review.Product.BusinessId ?? 0
            },
            Media = review.Media?.Select(m => new MediaDTO
            {
                MediaId = m.MediaId,
                UserId = m.UserId,
                FileName = m.FileName,
                FilePath = m.FilePath,
                FileType = m.FileType,
                FileSize = m.FileSize,
                UploadedAt = m.UploadedAt,
                ReviewId = m.ReviewId
            }).ToList() ?? new List<MediaDTO>()
        };
    }

    // GET: /api/review
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewDTO>>> GetReviews(
        [FromQuery] int? businessId, 
        [FromQuery] int? userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Business)
            .Include(r => r.Product)
            .Include(r => r.Comments)
                .ThenInclude(c => c.Commenter)
            .Include(r => r.Reactions)
                .ThenInclude(re => re.User)
            .Include(r => r.Tags)
            .Include(r => r.Media)
            .AsQueryable();

        if (businessId.HasValue)
            query = query.Where(r => r.BusinessId == businessId.Value);

        if (userId.HasValue)
            query = query.Where(r => r.UserId == userId.Value);

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => MapReviewToDto(r))
            .ToListAsync();

        return Ok(reviews);
    }

    // GET: /api/review/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ReviewDTO>> GetReview(int id)
    {
        var review = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Product)
            .Include(r => r.Business)
            .Include(r => r.Comments)
                .ThenInclude(c => c.Commenter)
            .Include(r => r.Reactions)
                .ThenInclude(re => re.User)
            .Include(r => r.Tags)
            .Include(r => r.Media)
            .FirstOrDefaultAsync(r => r.ReviewId == id);

        if (review == null)
            return NotFound();

        return Ok(MapReviewToDto(review));
    }

    // POST: /api/review
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReviewDTO>> CreateReview(CreateReviewDTO createReviewDTO)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var business = await _context.Businesses.FindAsync(createReviewDTO.BusinessId);

        if (business == null)
            return NotFound("Business not found");

        var review = new Review
        {
            UserId = userId,
            BusinessId = createReviewDTO.BusinessId,
            Rating = createReviewDTO.Rating,
            Comment = createReviewDTO.Comment,
            CreatedAt = DateTime.UtcNow,
            ProductId = createReviewDTO.ProductId,
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        if (createReviewDTO.Tags != null)
        {
            foreach (var tagType in createReviewDTO.Tags)
            {
                var tag = new Tag
                {
                    ReviewId = review.ReviewId,
                    TagType = tagType
                };
                _context.Tags.Add(tag);
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetReview), new { id = review.ReviewId }, await GetReview(review.ReviewId));
    }

    // PUT: /api/review/{id}
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(int id, UpdateReviewDTO updateReviewDTO)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (review.UserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            return Forbid();

        review.Rating = updateReviewDTO.Rating;
        review.Comment = updateReviewDTO.Comment;
        review.UpdatedAt = DateTime.UtcNow;

        if (updateReviewDTO.Tags != null)
        {
            var existingTags = await _context.Tags.Where(t => t.ReviewId == id).ToListAsync();
            _context.Tags.RemoveRange(existingTags);

            foreach (var tagType in updateReviewDTO.Tags)
            {
                var tag = new Tag
                {
                    ReviewId = review.ReviewId,
                    TagType = tagType
                };
                _context.Tags.Add(tag);
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/review/{id}
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (review.UserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            return Forbid();

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST: /api/review/{id}/comment
    [Authorize]
    [HttpPost("{id}/comment")]
    public async Task<ActionResult<CommentDTO>> AddComment(int id, CreateCommentDTO createCommentDTO)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound("Review not found");

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var comment = new Comment
        {
            CommenterId = userId,
            ReviewId = id,
            Content = createCommentDTO.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var createdComment = await _context.Comments
            .Include(c => c.Commenter)
            .FirstOrDefaultAsync(c => c.CommentId == comment.CommentId);

        return Ok(new CommentDTO
        {
            CommentId = createdComment!.CommentId,
            CommenterId = createdComment.CommenterId,
            ReviewId = createdComment.ReviewId,
            Content = createdComment.Content,
            CreatedAt = createdComment.CreatedAt ?? DateTime.UtcNow,
            Commenter = new UserDTO
            {
                UserId = createdComment.Commenter.UserId,
                Email = createdComment.Commenter.Email,
                UserName = createdComment.Commenter.UserName,
                Type = createdComment.Commenter.Type,
                IsVerified = createdComment.Commenter.IsVerified,
                ProfilePic = createdComment.Commenter.ProfilePic,
                Bio = createdComment.Commenter.Bio,
                CreatedAt = createdComment.Commenter.CreatedAt,
                ReputationPoints = createdComment.Commenter.ReputationPoints
            }
        });
    }

    // POST: /api/review/{id}/reaction
    [Authorize]
    [HttpPost("{id}/reaction")]
    public async Task<ActionResult<ReactionDTO>> AddReaction(int id, CreateReactionDTO createReactionDTO)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound("Review not found");

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var existingReaction = await _context.Reactions
            .FirstOrDefaultAsync(r => r.ReviewId == id && r.UserId == userId);

        if (existingReaction != null)
        {
            if (existingReaction.ReactionType == createReactionDTO.ReactionType)
            {
                _context.Reactions.Remove(existingReaction);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            existingReaction.ReactionType = createReactionDTO.ReactionType;
            existingReaction.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            var reaction = new Reaction
            {
                ReviewId = id,
                UserId = userId,
                ReactionType = createReactionDTO.ReactionType,
                CreatedAt = DateTime.UtcNow
            };
            _context.Reactions.Add(reaction);
        }

        await _context.SaveChangesAsync();

        var createdReaction = await _context.Reactions
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.ReviewId == id && r.UserId == userId);

        return Ok(new ReactionDTO
        {
            ReactionId = createdReaction!.ReactionId,
            ReviewId = createdReaction.ReviewId,
            UserId = createdReaction.UserId,
            ReactionType = createdReaction.ReactionType ?? string.Empty,
            CreatedAt = createdReaction.CreatedAt ?? DateTime.UtcNow,
            User = new UserDTO
            {
                UserId = createdReaction.User.UserId,
                Email = createdReaction.User.Email,
                UserName = createdReaction.User.UserName,
                Type = createdReaction.User.Type,
                IsVerified = createdReaction.User.IsVerified,
                ProfilePic = createdReaction.User.ProfilePic,
                Bio = createdReaction.User.Bio,
                CreatedAt = createdReaction.User.CreatedAt,
                ReputationPoints = createdReaction.User.ReputationPoints
            }
        });
    }
}