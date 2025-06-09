using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.DTOs;

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
        return await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => new UserBadgeDTO
            {
                UserBadgeId = ub.UserBadgeId,
                UserId = ub.UserId,
                BadgeId = ub.BadgeId,
                AwardedAt = ub.AwardedAt,
                Badge = new BadgeDTO
                {
                    BadgeId = ub.Badge.BadgeId,
                    Name = ub.Badge.Name,
                    Description = ub.Badge.Description,
                    Icon = ub.Badge.Icon,
                    CreatedAt = ub.Badge.CreatedAt
                },
                User = new UserDTO
                {
                    UserId = ub.User.UserId,
                    Email = ub.User.Email,
                    UserName = ub.User.UserName,
                    Type = ub.User.Type,
                    IsVerified = ub.User.IsVerified,
                    ProfilePic = ub.User.ProfilePic,
                    Bio = ub.User.Bio,
                    CreatedAt = ub.User.CreatedAt,
                    ReputationPoints = ub.User.ReputationPoints
                }
            })
            .ToListAsync();
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<UserBadgeDTO>> AwardBadge(AwardBadgeDTO awardBadgeDTO)
    {
        var user = await _context.Users.FindAsync(awardBadgeDTO.UserId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        var badge = await _context.Badges.FindAsync(awardBadgeDTO.BadgeId);
        if (badge == null)
        {
            return NotFound("Badge not found");
        }

        var existingUserBadge = await _context.UserBadges
            .FirstOrDefaultAsync(ub => ub.UserId == awardBadgeDTO.UserId && ub.BadgeId == awardBadgeDTO.BadgeId);

        if (existingUserBadge != null)
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
            UserBadgeId = userBadge.UserBadgeId,
            UserId = userBadge.UserId,
            BadgeId = userBadge.BadgeId,
            AwardedAt = userBadge.AwardedAt,
            Badge = new BadgeDTO
            {
                BadgeId = badge.BadgeId,
                Name = badge.Name,
                Description = badge.Description,
                Icon = badge.Icon,
                CreatedAt = badge.CreatedAt
            },
            User = new UserDTO
            {
                UserId = user.UserId,
                Email = user.Email,
                UserName = user.UserName,
                Type = user.Type,
                IsVerified = user.IsVerified,
                ProfilePic = user.ProfilePic,
                Bio = user.Bio,
                CreatedAt = user.CreatedAt,
                ReputationPoints = user.ReputationPoints
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