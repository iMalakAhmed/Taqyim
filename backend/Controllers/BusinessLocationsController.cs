using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.DTOs;

namespace Taqyim.Api.Controllers
{
    [ApiController]
    [Route("api/businesses/{businessId}/locations")]
    public class BusinessLocationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BusinessLocationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET /api/businesses/{businessId}/locations
        [HttpGet]
        public async Task<IActionResult> GetLocations(int businessId)
        {
            var business = await _context.Businesses
                .Include(b => b.BusinessLocations)
                .FirstOrDefaultAsync(b => b.BusinessId == businessId && !b.IsDeleted);

            if (business == null) return NotFound("Business not found.");

            return Ok(business.BusinessLocations.Select(loc => new
            {
                loc.LocationId,
                loc.Label,
                loc.Address,
                loc.Latitude,
                loc.Longitude,
                loc.CreatedAt
            }));
        }

        // POST /api/businesses/{businessId}/locations
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddLocation(int businessId, [FromBody] BusinessLocationCreateDto dto)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null || business.IsDeleted) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = business.UserId == userId;
            var isModerator = User.IsInRole("Admin") || User.IsInRole("Moderator");

            if (!isOwner && !isModerator) return Forbid();

            var location = new BusinessLocation
            {
                BusinessId = businessId,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Label = dto.Label,
                CreatedAt = DateTime.UtcNow
            };

            _context.BusinessLocations.Add(location);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Location added", location.LocationId });
        }

        // PUT /api/businesses/{businessId}/locations/{locationId}
        [Authorize]
        [HttpPut("{locationId}")]
        public async Task<IActionResult> UpdateLocation(int businessId, int locationId, [FromBody] BusinessLocationUpdateDto dto)
        {
            var location = await _context.BusinessLocations
                .Include(l => l.Business)
                .FirstOrDefaultAsync(l => l.LocationId == locationId && l.BusinessId == businessId);

            if (location == null || location.Business.IsDeleted)
                return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = location.Business.UserId == userId;
            var isModerator = User.IsInRole("Admin") || User.IsInRole("Moderator");

            if (!isOwner && !isModerator) return Forbid();

            location.Label = dto.Label ?? location.Label;
            location.Address = dto.Address ?? location.Address;
            location.Latitude = dto.Latitude ?? location.Latitude;
            location.Longitude = dto.Longitude ?? location.Longitude;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Location updated." });
        }

        // DELETE /api/businesses/{businessId}/locations/{locationId}
        [Authorize]
        [HttpDelete("{locationId}")]
        public async Task<IActionResult> DeleteLocation(int businessId, int locationId)
        {
            var location = await _context.BusinessLocations
                .Include(l => l.Business)
                .FirstOrDefaultAsync(l => l.LocationId == locationId && l.BusinessId == businessId);

            if (location == null || location.Business.IsDeleted)
                return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = location.Business.UserId == userId;
            var isModerator = User.IsInRole("Admin") || User.IsInRole("Moderator");

            if (!isOwner && !isModerator) return Forbid();

            _context.BusinessLocations.Remove(location);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
