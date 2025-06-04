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
public class ReactionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReactionController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /api/reaction/review/{reviewId}
    [HttpGet("review/{reviewId}")]
    public async Task<ActionResult<IEnumerable<ReactionDTO>>> GetReactionsByReview(int reviewId)
    {
        var reactions = await _context.Reactions
            .Include(r => r.User)
            .Where(r => r.ReviewId == reviewId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReactionDTO
            {
                ReactionId = r.ReactionId,
                ReviewId = r.ReviewId,
                UserId = r.UserId,
                ReactionType = r.ReactionType ?? string.Empty,
                CreatedAt = r.CreatedAt ?? DateTime.UtcNow,
                User = new UserDTO
                {
                    UserId = r.User.UserId,
                    Email = r.User.Email,
                    FirstName = r.User.FirstName,
                    LastName = r.User.LastName,
                    Type = r.User.Type,
                    IsVerified = r.User.IsVerified,
                    ProfilePic = r.User.ProfilePic,
                    Bio = r.User.Bio,
                    CreatedAt = r.User.CreatedAt,
                    ReputationPoints = r.User.ReputationPoints
                }
            })
            .ToListAsync();

        return reactions;
    }

    // GET: /api/reaction/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ReactionDTO>> GetReaction(int id)
    {
        var reaction = await _context.Reactions
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.ReactionId == id);

        if (reaction == null)
            return NotFound();

        return new ReactionDTO
        {
            ReactionId = reaction.ReactionId,
            ReviewId = reaction.ReviewId,
            UserId = reaction.UserId,
            ReactionType = reaction.ReactionType ?? string.Empty,
            CreatedAt = reaction.CreatedAt ?? DateTime.UtcNow,
            User = new UserDTO
            {
                UserId = reaction.User.UserId,
                Email = reaction.User.Email,
                FirstName = reaction.User.FirstName,
                LastName = reaction.User.LastName,
                Type = reaction.User.Type,
                IsVerified = reaction.User.IsVerified,
                ProfilePic = reaction.User.ProfilePic,
                Bio = reaction.User.Bio,
                CreatedAt = reaction.User.CreatedAt,
                ReputationPoints = reaction.User.ReputationPoints
            }
        };
    }

    // POST: /api/reaction
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReactionDTO>> CreateReaction(CreateReactionDTO createReactionDTO)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var review = await _context.Reviews.FindAsync(createReactionDTO.ReviewId);

        if (review == null)
            return NotFound("Review not found");

        var existingReaction = await _context.Reactions
            .FirstOrDefaultAsync(r => r.ReviewId == createReactionDTO.ReviewId && r.UserId == userId);

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
                ReviewId = createReactionDTO.ReviewId,
                UserId = userId,
                ReactionType = createReactionDTO.ReactionType,
                CreatedAt = DateTime.UtcNow
            };
            _context.Reactions.Add(reaction);
        }

        await _context.SaveChangesAsync();

        var createdReaction = await _context.Reactions
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.ReviewId == createReactionDTO.ReviewId && r.UserId == userId);

        return new ReactionDTO
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
                FirstName = createdReaction.User.FirstName,
                LastName = createdReaction.User.LastName,
                Type = createdReaction.User.Type,
                IsVerified = createdReaction.User.IsVerified,
                ProfilePic = createdReaction.User.ProfilePic,
                Bio = createdReaction.User.Bio,
                CreatedAt = createdReaction.User.CreatedAt,
                ReputationPoints = createdReaction.User.ReputationPoints
            }
        };
    }

    // DELETE: /api/reaction/{id}
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReaction(int id)
    {
        var reaction = await _context.Reactions.FindAsync(id);
        if (reaction == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (reaction.UserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            return Forbid();

        _context.Reactions.Remove(reaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
} 