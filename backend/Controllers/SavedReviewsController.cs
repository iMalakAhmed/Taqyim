using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.Models;

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
public async Task<ActionResult<List<Review>>> GetSavedReviews(int userId)
{
    var reviews = await _context.SavedReviews
        .Where(sr => sr.UserId == userId)
        .Select(sr => sr.Review)
        .Include(r => r.Business)
        .Include(r => r.User)
        .ToListAsync();

    return Ok(reviews);
}

}
