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
    public async Task<ActionResult<IEnumerable<CommentReactionDTO>>> GetReactionsForComment(int commentId)
    {
        var reactions = await _context.CommentReactions
            .Where(r => r.CommentId == commentId)
            .Select(r => new CommentReactionDTO
            {
                CommentReactionId = r.CommentReactionId,
                UserId = r.UserId,
                ReactionType = r.ReactionType,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return reactions;
    }

    // POST: /api/commentreaction
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentReactionDTO>> AddOrUpdateReaction(CreateCommentReactionDTO dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var comment = await _context.Comments.FindAsync(dto.CommentId);
        if (comment == null)
            return NotFound("Comment not found");

        var existingReaction = await _context.CommentReactions
            .FirstOrDefaultAsync(r => r.CommentId == dto.CommentId && r.UserId == userId);

        if (existingReaction != null)
        {
            existingReaction.ReactionType = dto.ReactionType;
            existingReaction.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            var newReaction = new CommentReaction
            {
                CommentId = dto.CommentId,
                UserId = userId,
                ReactionType = dto.ReactionType,
                CreatedAt = DateTime.UtcNow
            };
            _context.CommentReactions.Add(newReaction);
        }

        await _context.SaveChangesAsync();

        var result = await _context.CommentReactions
            .Where(r => r.CommentId == dto.CommentId && r.UserId == userId)
            .Select(r => new CommentReactionDTO
            {
                CommentReactionId = r.CommentReactionId,
                UserId = r.UserId,
                ReactionType = r.ReactionType,
                CreatedAt = r.CreatedAt
            })
            .FirstOrDefaultAsync();

        return Ok(result);
    }

    // DELETE: /api/commentreaction/{commentId}
    [Authorize]
    [HttpDelete("{commentId}")]
    public async Task<IActionResult> RemoveReaction(int commentId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var reaction = await _context.CommentReactions
            .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

        if (reaction == null)
            return NotFound("Reaction not found");

        _context.CommentReactions.Remove(reaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
