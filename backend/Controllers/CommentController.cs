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
public class CommentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /api/comment/review/{reviewId}
    [HttpGet("review/{reviewId}")]
    public async Task<ActionResult<IEnumerable<CommentDTO>>> GetCommentsByReview(int reviewId)
    {
        var comments = await _context.Comments
            .Include(c => c.Commenter)
            .Include(c => c.Reactions)
            .Include(c => c.Replies)
                .ThenInclude(r => r.Commenter)
            .Include(c => c.Replies)
                .ThenInclude(r => r.Reactions)
            .Where(c => c.ReviewId == reviewId && c.ParentCommentId == null)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return comments.Select(MapCommentToDTO).ToList();
    }

    // GET: /api/comment/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CommentDTO>> GetComment(int id)
    {
        var comment = await _context.Comments
            .Include(c => c.Commenter)
            .Include(c => c.Reactions)
            .Include(c => c.Replies)
                .ThenInclude(r => r.Commenter)
            .Include(c => c.Replies)
                .ThenInclude(r => r.Reactions)
            .FirstOrDefaultAsync(c => c.CommentId == id);

        if (comment == null)
            return NotFound();

        return MapCommentToDTO(comment);
    }

    // POST: /api/comment
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentDTO>> CreateComment(CreateCommentDTO createCommentDTO)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var review = await _context.Reviews.FindAsync(createCommentDTO.ReviewId);

        if (review == null)
            return NotFound("Review not found");

        var comment = new Comment
        {
            CommenterId = userId,
            ReviewId = createCommentDTO.ReviewId,
            Content = createCommentDTO.Content,
            CreatedAt = DateTime.UtcNow,
            ParentCommentId = createCommentDTO.ParentCommentId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return await GetComment(comment.CommentId);
    }

    // PUT: /api/comment/{id}
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(int id, CreateCommentDTO updateCommentDTO)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (comment.CommenterId != userId && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            return Forbid();

        comment.Content = updateCommentDTO.Content;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: /api/comment/{id}
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (comment.CommenterId != userId && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            return Forbid();

        
        comment.IsDeleted = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }


    // Mapping helper
    private CommentDTO MapCommentToDTO(Comment comment)
    {
        return new CommentDTO
        {
            CommentId = comment.CommentId,
            CommenterId = comment.CommenterId,
            ReviewId = comment.ReviewId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt ?? DateTime.UtcNow,
            ParentCommentId = comment.ParentCommentId,
            Commenter = new UserDTO
            {
                UserId = comment.Commenter.UserId,
                Email = comment.Commenter.Email,
                FirstName = comment.Commenter.FirstName,
                LastName = comment.Commenter.LastName,
                Type = comment.Commenter.Type,
                IsVerified = comment.Commenter.IsVerified,
                ProfilePic = comment.Commenter.ProfilePic,
                Bio = comment.Commenter.Bio,
                CreatedAt = comment.Commenter.CreatedAt,
                ReputationPoints = comment.Commenter.ReputationPoints
            },
            Replies = comment.Replies?.Select(MapCommentToDTO).ToList() ?? new List<CommentDTO>(),
            Reactions = comment.Reactions?.Select(r => new CommentReactionDTO
            {
                CommentReactionId = r.CommentReactionId,
                UserId = r.UserId,
                ReactionType = r.ReactionType,
                CreatedAt = r.CreatedAt
            }).ToList() ?? new List<CommentReactionDTO>()
        };
    }
}
