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
public class BadgeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BadgeController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BadgeDTO>>> GetBadges()
    {
        var badges = await _context.Badges
            .Select(b => new BadgeDTO
            {
                BadgeId = b.BadgeId,
                Name = b.Name,
                Description = b.Description,
                Icon = b.Icon,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(badges);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BadgeDTO>> GetBadge(int id)
    {
        var badge = await _context.Badges.FindAsync(id);

        if (badge == null)
        {
            return NotFound();
        }

        return new BadgeDTO
        {
            BadgeId = badge.BadgeId,
            Name = badge.Name,
            Description = badge.Description,
            Icon = badge.Icon,
            CreatedAt = badge.CreatedAt
        };
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<BadgeDTO>> CreateBadge(CreateBadgeDTO createBadgeDTO)
    {
        var badge = new Badge
        {
            Name = createBadgeDTO.Name,
            Description = createBadgeDTO.Description,
            Icon = createBadgeDTO.Icon,
            CreatedAt = DateTime.UtcNow
        };

        _context.Badges.Add(badge);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBadge), new { id = badge.BadgeId }, new BadgeDTO
        {
            BadgeId = badge.BadgeId,
            Name = badge.Name,
            Description = badge.Description,
            Icon = badge.Icon,
            CreatedAt = badge.CreatedAt
        });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBadge(int id, UpdateBadgeDTO updateBadgeDTO)
    {
        var badge = await _context.Badges.FindAsync(id);

        if (badge == null)
        {
            return NotFound();
        }

        badge.Name = updateBadgeDTO.Name;
        badge.Description = updateBadgeDTO.Description;
        badge.Icon = updateBadgeDTO.Icon;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BadgeExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBadge(int id)
    {
        var badge = await _context.Badges.FindAsync(id);
        if (badge == null)
        {
            return NotFound();
        }

        _context.Badges.Remove(badge);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool BadgeExists(int id)
    {
        return _context.Badges.Any(e => e.BadgeId == id);
    }
} 