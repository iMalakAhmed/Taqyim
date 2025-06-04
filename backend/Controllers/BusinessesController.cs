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
    [Route("api/[controller]")]
    public class BusinessesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BusinessesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST /api/businesses
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateBusiness([FromBody] BusinessCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userType = User.FindFirst("Type")?.Value;

            if (userType != "BusinessOwner" && userType != "Admin")
                return Forbid("Only BusinessOwners or Admins can create businesses.");

            var business = new Business
            {
                UserId = userId,
                Name = dto.Name,
                Location = dto.Location,
                Category = dto.Category,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
                Logo = dto.Logo,
                VerifiedByUserId = 0 // Set to 0 initially, can be updated later
            };

            _context.Businesses.Add(business);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Business created", business.BusinessId });
        }

        // GET /api/businesses
        [HttpGet]
        public async Task<IActionResult> GetBusinesses([FromQuery] string? name, [FromQuery] string? category, [FromQuery] bool includeDeleted = false)
        {
            var query = _context.Businesses
                .Include(b => b.Reviews)
                    .ThenInclude(r => r.User)
                .Include(b => b.BusinessLocations)
                .AsQueryable();

            if (!includeDeleted)
                query = query.Where(b => !b.IsDeleted);

            if (!string.IsNullOrEmpty(name))
                query = query.Where(b => b.Name.Contains(name));

            if (!string.IsNullOrEmpty(category))
                query = query.Where(b => b.Category == category);

            var result = await query
                .Select(b => new
                {
                    b.BusinessId,
                    b.Name,
                    b.Category,
                    b.Location,
                    b.Description,
                    b.Logo,
                    AvgRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0,
                    ReviewsCount = b.Reviews.Count,
                    Reviews = b.Reviews.Select(r => new
                    {
                        r.ReviewId,
                        r.Rating,
                        r.Comment,
                        r.CreatedAt,
                        User = new
                        {
                            r.User.UserId,
                            r.User.FirstName,
                            r.User.LastName,
                            r.User.ProfilePic
                        }
                    }).ToList()
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET /api/businesses/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBusinessById(int id)
        {
            var business = await _context.Businesses
                .Include(b => b.Reviews)
                    .ThenInclude(r => r.User)
                .Include(b => b.BusinessLocations)
                .FirstOrDefaultAsync(b => b.BusinessId == id && !b.IsDeleted);

            if (business == null)
                return NotFound();

            return Ok(new
            {
                business.BusinessId,
                business.Name,
                business.Category,
                business.Location,
                business.Description,
                business.Logo,
                AvgRating = business.Reviews.Any() ? business.Reviews.Average(r => r.Rating) : 0,
                ReviewsCount = business.Reviews.Count,
                Reviews = business.Reviews.Select(r => new
                {
                    r.ReviewId,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    User = new
                    {
                        r.User.UserId,
                        r.User.FirstName,
                        r.User.LastName,
                        r.User.ProfilePic
                    }
                }).ToList()
            });
        }

        // PUT /api/businesses/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBusiness(int id, [FromBody] BusinessUpdateDto dto)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null || business.IsDeleted) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = business.UserId == userId;
            var isModerator = User.IsInRole("Moderator") || User.IsInRole("Admin");

            if (!isOwner && !isModerator)
                return Forbid();

            business.Name = dto.Name ?? business.Name;
            business.Category = dto.Category ?? business.Category;
            business.Description = dto.Description ?? business.Description;
            business.Logo = dto.Logo ?? business.Logo;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Business updated." });
        }

        // DELETE /api/businesses/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBusiness(int id)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null || business.IsDeleted) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = business.UserId == userId;
            var isModerator = User.IsInRole("Moderator") || User.IsInRole("Admin");

            if (!isOwner && !isModerator)
                return Forbid();

            business.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
