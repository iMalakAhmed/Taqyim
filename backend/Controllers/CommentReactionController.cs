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
public class CommentReactionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentReactionController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /api/commentreaction/comment/{commentId}
    [HttpGet("comment/{commentId}")]
    public async Task<ActionResult<IEnumerable<CommentReactionDTO>>> GetReactionsByComment(int commentId)
    {
        var reactions = await _context.CommentReactions
            .Include(r => r.User)
            .Where(r => r.CommentId == commentId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new CommentReactionDTO
            {
                CommentReactionId = r.CommentReactionId,
                CommentId = r.CommentId,
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

    // GET: /api/commentreaction/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CommentReactionDTO>> GetReaction(int id)
    {
        var reaction = await _context.CommentReactions
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.CommentReactionId == id);

        if (reaction == null)
            return NotFound();

        return new CommentReactionDTO
        {
            CommentReactionId = reaction.CommentReactionId,
            CommentId = reaction.CommentId,
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

    // POST: /api/commentreaction
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentReactionDTO>> CreateReaction(CreateCommentReactionDTO createDTO)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var comment = await _context.Comments.FindAsync(createDTO.CommentId);
        if (comment == null)
            return NotFound("Comment not found");

        var existingReaction = await _context.CommentReactions
            .FirstOrDefaultAsync(r => r.CommentId == createDTO.CommentId && r.UserId == userId);

        if (existingReaction != null)
        {
            if (existingReaction.ReactionType == createDTO.ReactionType)
            {
                _context.CommentReactions.Remove(existingReaction);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            existingReaction.ReactionType = createDTO.ReactionType;
            existingReaction.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            var reaction = new CommentReaction
            {
                CommentId = createDTO.CommentId,
                UserId = userId,
                ReactionType = createDTO.ReactionType,
                CreatedAt = DateTime.UtcNow
            };
            _context.CommentReactions.Add(reaction);
        }

        await _context.SaveChangesAsync();

        var createdReaction = await _context.CommentReactions
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.CommentId == createDTO.CommentId && r.UserId == userId);

        return new CommentReactionDTO
        {
            CommentReactionId = createdReaction!.CommentReactionId,
            CommentId = createdReaction.CommentId,
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

    // DELETE: /api/commentreaction/{id}
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReaction(int id)
    {
        var reaction = await _context.CommentReactions.FindAsync(id);
        if (reaction == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (reaction.UserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            return Forbid();

        _context.CommentReactions.Remove(reaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: /api/commentreaction/comment/{commentId}/user
    [Authorize]
    [HttpGet("comment/{commentId}/user")]
    public async Task<ActionResult<CommentReactionDTO?>> GetUserReactionForComment(int commentId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var reaction = await _context.CommentReactions
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

        if (reaction == null)
            return NoContent();

        return new CommentReactionDTO
        {
            CommentReactionId = reaction.CommentReactionId,
            CommentId = reaction.CommentId,
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
}
