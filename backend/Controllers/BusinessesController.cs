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
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return Forbid("User Not Found");

            var business = new Business
            {
                Name = dto.Name,
                Category = dto.Category,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
                VerifiedByUserId = null,
                Owner = user
            };
            user.Type = "BusinessOwner";


            _context.Businesses.Add(business);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Business created", business.BusinessId });
        }

        // GET /api/businesses
        [HttpGet]
        public async Task<IActionResult> GetBusinesses([FromQuery] string? name, [FromQuery] string? category, [FromQuery] bool includeDeleted = false)
        {
            var query = _context.Businesses
                .Include(b => b.Reviews).ThenInclude(r => r.User)
                .Include(b => b.Owner)
                .Include(b => b.BusinessLocations)
                .Include(b=> b.Products)
                .AsQueryable();

            if (!includeDeleted)
                query = query.Where(b => !b.IsDeleted);

            if (!string.IsNullOrEmpty(name))
                query = query.Where(b => b.Owner.UserName.Contains(name));

            var result = await query
                .Select(b => new
                {
                    b.BusinessId,
                    b.Name,
                    b.Category,
                    b.Description,
                    b.Logo,
                    AvgRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0,
                    ReviewsCount = b.Reviews.Count,
                    BusinessLocations = b.BusinessLocations.Select(loc => new BusinessLocationDTO
                    {
                        LocationId = loc.LocationId,
                        BusinessId = loc.BusinessId,
                        Address = loc.Address ?? "",
                        Latitude = loc.Latitude != null ? (double?)loc.Latitude : 0,
                        Longitude = loc.Longitude != null ? (double?)loc.Longitude : 0,
                        Label = loc.Label ?? ""
                    }).ToList(),
                    Owner = new
                    {
                        b.Owner.UserId,
                        b.Owner.UserName
                    },
                    Reviews = b.Reviews.Select(r => new
                    {
                        r.ReviewId,
                        r.Rating,
                        r.Comment,
                        r.CreatedAt,
                        User = new
                        {
                            r.User.UserId,
                            r.User.UserName,
                            r.User.ProfilePic
                        }
                    }).ToList(),
                    Products=b.Products.Where(p => !p.IsDeleted).Select(p => new
                    {
                        p.ProductId,
                        p.Name,
                        p.Description,
                        p.IsDeleted,
                        BusinessId = p.BusinessId ?? 0
                    }).ToList(),
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
                .Include(b => b.Owner)
                .Include(b => b.BusinessLocations)
                .Include(b => b.Products)
                .FirstOrDefaultAsync(b => b.BusinessId == id && !b.IsDeleted);

            if (business == null) return NotFound();

            var result = new BusinessDTO
            {
                BusinessId = business.BusinessId,
                Name = business.Name,
                Category = business.Category ?? new List<string>(),
                Description = business.Description,
                Logo = business.Logo,
                Owner = new UserDTO
                {
                    UserId = business.Owner.UserId,
                    UserName = business.Owner.UserName,
                },
                BusinessLocations = business.BusinessLocations.Select(loc => new BusinessLocationDTO
                {
                    LocationId = loc.LocationId,
                    BusinessId = loc.BusinessId,
                    Address = loc.Address ?? "",
                    Latitude = loc.Latitude != null ? (double?)loc.Latitude : 0,
                    Longitude = loc.Longitude != null ? (double?)loc.Longitude : 0,
                    Label = loc.Label ?? ""
                }).ToList(),
                Products = business.Products.Where(p => !p.IsDeleted).Select(p => new ProductDTO
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Description = p.Description,
                    IsDeleted = p.IsDeleted,
                    BusinessId = p.BusinessId ?? 0
                }).ToList()
            };

            return Ok(result);
        }


        // PUT /api/businesses/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBusiness(int id, [FromBody] BusinessUpdateDto dto)
        {
            var business = await _context.Businesses
                .Include(b => b.Owner)
                .FirstOrDefaultAsync(b => b.BusinessId == id && !b.IsDeleted);
            if (business == null || business.IsDeleted) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = business.Owner.UserId == userId;
            var isModerator = User.IsInRole("Moderator") || User.IsInRole("Admin");

            if (!isOwner && !isModerator)
                return Forbid();
            business.Name = dto.Name ?? business.Name;
            business.Category = dto.Category;
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
            var business = await _context.Businesses
                .Include(b => b.Owner)
                .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.BusinessId == id);
            if (business == null || business.IsDeleted) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = business.Owner.UserId == userId;
            var isModerator = User.IsInRole("Moderator") || User.IsInRole("Admin");

            if (!isOwner && !isModerator)
                return Forbid();

            business.IsDeleted = true;
            await _context.SaveChangesAsync();

            // Check if the owner has any other non-deleted businesses
            var owner = business.Owner;
            bool hasOtherActiveBusinesses = await _context.Businesses
                .AnyAsync(b => b.Owner.UserId == owner.UserId && !b.IsDeleted);

            if (!hasOtherActiveBusinesses)
            {
                owner.Type = "User";
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
        
        [Authorize(Roles = "Admin,Moderator")]
        [HttpPut("{id}/verify")]
        public async Task<IActionResult> VerifyBusiness(int id)
        {
                var business = await _context.Businesses
                    .Include(b => b.Owner) 
                    .FirstOrDefaultAsync(b => b.BusinessId == id);
            if (business == null) return NotFound();

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            business.VerifiedByUserId = adminId;
            business.Owner.IsVerified = true;
            business.Owner.Type = "BusinessOwner";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Business verified." });
        }

        [Authorize(Roles = "Admin,Moderator")]
        [HttpPut("{id}/unverify")]
        public async Task<IActionResult> UnverifyBusiness(int id)
        {
            var business = await _context.Businesses
                .Include(b => b.Owner) 
                .FirstOrDefaultAsync(b => b.BusinessId == id);
                    
            if (business == null) return NotFound();

            business.VerifiedByUserId = null;
            business.Owner.IsVerified = false;
            business.Owner.Type = "User"; 

            await _context.SaveChangesAsync();
            return Ok(new { message = "Business unverified." });
        }
    }
}
