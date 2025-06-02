using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.DTOs;
using Taqyim.Api.Models;
using Taqyim.Api.Models.DTOs;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserBadgeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserBadgeController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<UserBadgeDTO>>> GetUserBadges(int userId)
    {
        var userBadges = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .Include(ub => ub.Badge)
            .Select(ub => new UserBadgeDTO
            {
                Id = ub.Id,
                UserId = ub.UserId,
                BadgeId = ub.BadgeId,
                AwardedAt = ub.AwardedAt,
                Badge = new BadgeDTO
                {
                    BadgeId = ub.Badge.BadgeId,
                    Name = ub.Badge.Name,
                    Description = ub.Badge.Description,
                    Img = ub.Badge.Img
                }
            })
            .ToListAsync();

        return Ok(userBadges);
    }

    [Authorize]
    [HttpPost("award")]
    public async Task<ActionResult<UserBadgeDTO>> AwardBadge(AwardBadgeDTO awardBadgeDTO)
    {
        // Check if user exists
        var user = await _context.Users.FindAsync(awardBadgeDTO.UserId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Check if badge exists
        var badge = await _context.Badges.FindAsync(awardBadgeDTO.BadgeId);
        if (badge == null)
        {
            return NotFound("Badge not found");
        }

        // Check if user already has this badge
        var existingBadge = await _context.UserBadges
            .FirstOrDefaultAsync(ub => ub.UserId == awardBadgeDTO.UserId && ub.BadgeId == awardBadgeDTO.BadgeId);

        if (existingBadge != null)
        {
            return BadRequest("User already has this badge");
        }

        var userBadge = new UserBadge
        {
            UserId = awardBadgeDTO.UserId,
            BadgeId = awardBadgeDTO.BadgeId,
            AwardedAt = DateTime.UtcNow
        };

        _context.UserBadges.Add(userBadge);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUserBadges), new { userId = userBadge.UserId }, new UserBadgeDTO
        {
            Id = userBadge.Id,
            UserId = userBadge.UserId,
            BadgeId = userBadge.BadgeId,
            AwardedAt = userBadge.AwardedAt,
            Badge = new BadgeDTO
            {
                BadgeId = badge.BadgeId,
                Name = badge.Name,
                Description = badge.Description,
                Img = badge.Img
            }
        });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveBadge(int id)
    {
        var userBadge = await _context.UserBadges.FindAsync(id);
        if (userBadge == null)
        {
            return NotFound();
        }

        _context.UserBadges.Remove(userBadge);
        await _context.SaveChangesAsync();

        return NoContent();
    }
} 