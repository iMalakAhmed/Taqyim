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
public class TagController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TagController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /api/tag/review/{reviewId}
    [HttpGet("review/{reviewId}")]
    public async Task<ActionResult<IEnumerable<TagDTO>>> GetTagsByReview(int reviewId)
    {
        var tags = await _context.Tags
            .Where(t => t.ReviewId == reviewId)
            .Select(t => new TagDTO
            {
                TagId = t.TagId,
                TagType = t.TagType,
                ReviewId = t.ReviewId
            })
            .ToListAsync();

        return tags;
    }

    // GET: /api/tag/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TagDTO>> GetTag(int id)
    {
        var tag = await _context.Tags.FindAsync(id);

        if (tag == null)
            return NotFound();

        return new TagDTO
        {
            TagId = tag.TagId,
            TagType = tag.TagType,
            ReviewId = tag.ReviewId
        };
    }

    // POST: /api/tag
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<TagDTO>> CreateTag(TagDTO tagDTO)
    {
        var review = await _context.Reviews.FindAsync(tagDTO.ReviewId);
        if (review == null)
            return NotFound("Review not found");

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (review.UserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            return Forbid();

        var tag = new Tag
        {
            ReviewId = tagDTO.ReviewId,
            TagType = tagDTO.TagType
        };

        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();

        return new TagDTO
        {
            TagId = tag.TagId,
            TagType = tag.TagType,
            ReviewId = tag.ReviewId
        };
    }

    // DELETE: /api/tag/{id}
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        var tag = await _context.Tags
            .Include(t => t.Review)
            .FirstOrDefaultAsync(t => t.TagId == id);

        if (tag == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (tag.Review.UserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Moderator"))
            return Forbid();

        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();

        return NoContent();
    }
} 