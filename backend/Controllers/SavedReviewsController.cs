using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class SavedReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SavedReviewsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("{reviewId}")]
    public async Task<IActionResult> SaveReview(int reviewId, [FromBody] int userId)
    {
        var alreadySaved = await _context.SavedReviews
            .AnyAsync(sr => sr.UserId == userId && sr.ReviewId == reviewId);

        if (alreadySaved)
            return BadRequest("Review already saved");

        var saved = new SavedReview
        {
            ReviewId = reviewId,
            UserId = userId
        };

        _context.SavedReviews.Add(saved);
        await _context.SaveChangesAsync();

        return Ok(saved);
    }

    [HttpDelete("{reviewId}")]
    public async Task<IActionResult> UnsaveReview(int reviewId, [FromQuery] int userId)
    {
        var saved = await _context.SavedReviews
            .FirstOrDefaultAsync(sr => sr.UserId == userId && sr.ReviewId == reviewId);

        if (saved == null)
            return NotFound();

        _context.SavedReviews.Remove(saved);
        await _context.SaveChangesAsync();

        return Ok();
    }

        [HttpGet("{userId}")]
    public async Task<ActionResult> GetSavedReviews(
        int userId, 
        [FromQuery] int page = 1,          // default page 1
        [FromQuery] int limit = 10)        // default 10 items per page
    {
        if (page <= 0) page = 1;
        if (limit <= 0) limit = 10;

        var query = _context.SavedReviews
            .Where(sr => sr.UserId == userId)
            .Select(sr => sr.Review)
            .Include(r => r.Business)
            .Include(r => r.User)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var reviews = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return Ok(new
        {
            total = totalCount,
            page,
            limit,
            reviews
        });
    }

[Authorize]
[HttpDelete("{reviewId}")]
public async Task<IActionResult> UnsaveReview(int reviewId)
{
    var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (userIdClaim == null) return Unauthorized();

    int userId = int.Parse(userIdClaim.Value);

    var saved = await _context.SavedReviews
        .FirstOrDefaultAsync(sr => sr.UserId == userId && sr.ReviewId == reviewId);

    if (saved == null)
        return NotFound();

    _context.SavedReviews.Remove(saved);
    await _context.SaveChangesAsync();

    return Ok();
}


}