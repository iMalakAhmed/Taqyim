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
                .Include(b => b.Products)
                .Include(b=> b.ConnectionFollowers)
                .Include(b => b.ConnectionFollowings)
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
                    FollowerCount = _context.Connections
                        .Count(c => c.FollowingType == "Business" && c.BusinessFollowingId == b.BusinessId),
                    FollowingCount = _context.Connections
                        .Count(c => c.FollowerType == "Business" && c.BusinessFollowerId == b.BusinessId),
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
                    Products = b.Products.Where(p => !p.IsDeleted).Select(p => new
                    {
                        p.ProductId,
                        p.Name,
                        p.Description,
                        p.IsDeleted,
                        BusinessId = p.BusinessId ?? 0
                    }).ToList(),
                    ConnectionFollowers = b.ConnectionFollowers.Select(cf => new
                    {
                        cf.ConnectionId,
                        cf.FollowerType,
                        cf.FollowerId,
                        cf.BusinessFollowerId,
                        User = cf.FollowerType == "User" && cf.Follower != null
                            ? new
                            {
                                cf.Follower.UserId,
                                cf.Follower.UserName
                            }
                            : null,
                        Business = cf.FollowerType == "Business" && cf.BusinessFollower != null
                            ? new
                            {
                                cf.BusinessFollower.BusinessId,
                                cf.BusinessFollower.Name,
                                cf.BusinessFollower.Logo
                            }
                            : null
                    }).ToList(),
                    ConnectionFollowings = b.ConnectionFollowings.Select(cf => new
                    {
                        cf.ConnectionId,
                        cf.FollowingType,
                        cf.FollowingId,
                        cf.BusinessFollowingId,
                        User = cf.FollowingType == "User" && cf.Following != null
                            ? new
                            {
                                cf.Following.UserId,
                                cf.Following.UserName
                            }
                            : null,
                        Business = cf.FollowingType == "Business" && cf.BusinessFollowing != null
                            ? new
                            {
                                cf.BusinessFollowing.BusinessId,
                                cf.BusinessFollowing.Name,
                                cf.BusinessFollowing.Logo
                            }
                            : null
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
                .Include(b => b.Owner)
                .Include(b => b.BusinessLocations)
                .Include(b => b.Products)
                .Include(b => b.ConnectionFollowers)
                .Include(b => b.ConnectionFollowings)
                .FirstOrDefaultAsync(b => b.BusinessId == id && !b.IsDeleted);

            if (business == null) return NotFound();
            var followerCount = await _context.Connections
                .CountAsync(c => c.FollowingType == "Business" && c.BusinessFollowingId == business.BusinessId);

            var followingCount = await _context.Connections
                .CountAsync(c => c.FollowerType == "Business" && c.BusinessFollowerId == business.BusinessId);


            var result = new BusinessDTO
            {
                BusinessId = business.BusinessId,
                Name = business.Name,
                Category = business.Category ?? new List<string>(),
                Description = business.Description,
                Logo = business.Logo,
                FollowerCount = followerCount,
                FollowingCount = followingCount,
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
                }).ToList(),
                ConnectionFollowers = (business.ConnectionFollowers ?? new List<Connection>()).Select(cf => new ConnectionDTO
                {
                    ConnectionId = cf.ConnectionId,
                    FollowerType = cf.FollowerType,
                    FollowingType = cf.FollowingType,
                    UserId = cf.FollowerId??0,
                    ConnectedUserId = cf.FollowingId ?? 0,
                    BusinessFollowerId = cf.BusinessFollowerId,
                    BusinessFollowingId = cf.BusinessFollowingId,
                    CreatedAt = cf.CreatedAt,
                    User = cf.FollowerType == "User" && cf.Follower != null
                        ? new UserDTO
                        {
                            UserId = cf.Follower.UserId,
                            UserName = cf.Follower.UserName,
                            ProfilePic = cf.Follower.ProfilePic
                        }
                        : null,
                    UserBusiness = cf.FollowerType == "Business" && cf.BusinessFollower != null
                        ? new BusinessDTO
                        {
                            BusinessId = cf.BusinessFollower.BusinessId,
                            Name = cf.BusinessFollower.Name,
                            Logo = cf.BusinessFollower.Logo,
                            Description = cf.BusinessFollower.Description,
                            Category = cf.BusinessFollower.Category ?? new List<string>(),
                            BusinessLocations = (cf.BusinessFollower.BusinessLocations ?? new List<BusinessLocation>()).Select(bl => new BusinessLocationDTO
                            {
                                LocationId = bl.LocationId,
                                Label = bl.Label,
                                Address = bl.Address,
                                Latitude = (double?)bl.Latitude,
                                Longitude = (double?)bl.Longitude,
                                CreatedAt = bl.CreatedAt ?? DateTime.UtcNow
                            }).ToList()
                        }
                        : null
                }).ToList(),

                ConnectionFollowings = (business.ConnectionFollowings ?? new List<Connection>()).Select(cf => new ConnectionDTO
                {
                    ConnectionId = cf.ConnectionId,
                    FollowerType = cf.FollowerType,
                    FollowingType = cf.FollowingType,
                    UserId = cf.FollowerId??0,
                    ConnectedUserId = cf.FollowingId??0,
                    BusinessFollowerId = cf.BusinessFollowerId,
                    BusinessFollowingId = cf.BusinessFollowingId,
                    CreatedAt = cf.CreatedAt,
                    User = cf.FollowingType == "User" && cf.Following != null
                        ? new UserDTO
                        {
                            UserId = cf.Following.UserId,
                            UserName = cf.Following.UserName,
                            ProfilePic = cf.Following.ProfilePic
                        }
                        : null,
                    UserBusiness = cf.FollowingType == "Business" && cf.BusinessFollowing != null
                        ? new BusinessDTO
                        {
                            BusinessId = cf.BusinessFollowing.BusinessId,
                            Name = cf.BusinessFollowing.Name,
                            Logo = cf.BusinessFollowing.Logo,
                            Description = cf.BusinessFollowing.Description,
                            Category = cf.BusinessFollowing.Category ?? new List<string>(),
                            BusinessLocations = (cf.BusinessFollowing.BusinessLocations ?? new List<BusinessLocation>()).Select(bl => new BusinessLocationDTO
                            {
                                LocationId = bl.LocationId,
                                Label = bl.Label,
                                Address = bl.Address,
                                Latitude = (double?)bl.Latitude,
                                Longitude = (double?)bl.Longitude,
                                CreatedAt = bl.CreatedAt ?? DateTime.UtcNow
                            }).ToList()
                        }
                        : null
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
