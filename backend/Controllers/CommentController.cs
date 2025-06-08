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
        .Include(c => c.Reactions).ThenInclude(r => r.User)
        .Where(c => c.ReviewId == reviewId)
        .ToListAsync();

    // Convert all to DTOs first
    var commentDtos = comments.Select(c => new CommentDTO
    {
        CommentId = c.CommentId,
        CommenterId = c.CommenterId,
        ReviewId = c.ReviewId,
        Content = c.Content,
        isDeleted = c.isDeleted,
        CreatedAt = c.CreatedAt ?? DateTime.UtcNow,
        ParentCommentId = c.ParentCommentId,
        Commenter = new UserDTO
        {
            UserId = c.Commenter.UserId,
            Email = c.Commenter.Email,
            FirstName = c.Commenter.FirstName,
            LastName = c.Commenter.LastName,
            Type = c.Commenter.Type,
            IsVerified = c.Commenter.IsVerified,
            ProfilePic = c.Commenter.ProfilePic,
            Bio = c.Commenter.Bio,
            CreatedAt = c.Commenter.CreatedAt,
            ReputationPoints = c.Commenter.ReputationPoints
        },
        Reactions = c.Reactions?.Select(r => new CommentReactionDTO
        {
            CommentReactionId = r.CommentReactionId,
            CommentId = r.CommentId,
            UserId = r.UserId,
            ReactionType = r.ReactionType,
            CreatedAt = r.CreatedAt,
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
        }).ToList() ?? new List<CommentReactionDTO>(),
        Replies = new List<CommentDTO>() // Will be filled in next step
    }).ToList();

    // Create lookup dictionary
    var commentDtoDict = commentDtos.ToDictionary(c => c.CommentId);

    // Build hierarchy
    List<CommentDTO> rootComments = new();
    foreach (var dto in commentDtos)
    {
        if (dto.ParentCommentId != null && commentDtoDict.ContainsKey(dto.ParentCommentId.Value))
        {
            commentDtoDict[dto.ParentCommentId.Value].Replies.Add(dto);
        }
        else
        {
            rootComments.Add(dto);
        }
    }

    return rootComments;
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

        
        comment.isDeleted = true;
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
            isDeleted = comment.isDeleted,
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
                CommentId = r.CommentId,
                UserId = r.UserId,
                ReactionType = r.ReactionType,
                CreatedAt = r.CreatedAt,
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
            }).ToList() ?? new List<CommentReactionDTO>()

        };
    }
}
