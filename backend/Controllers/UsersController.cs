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
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /api/users (Admin or Moderator only)
        [Authorize(Roles = "Admin,Moderator")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.BusinessUsers)
                .Where(u => u.Type != "Deleted")
                .Select(u => new
                {
                    u.UserId,
                    u.Email,
                    u.UserName,
                    u.Type,
                    u.ProfilePic,
                    u.Bio,
                    u.ReputationPoints,
                    u.CreatedAt,
                    u.IsVerified,
                    UsersBusinesses = u.BusinessUsers
                    .Where(b => !b.IsDeleted)
                    .Select(b => new Business
                    {
                        BusinessId = b.BusinessId,
                        Name = b.Name,
                        BusinessLocations = b.BusinessLocations
                            .Where(bl => !b.IsDeleted)
                            .Select(bl => new BusinessLocation
                            {
                                LocationId = bl.LocationId,
                                Label = bl.Label,
                                Address = bl.Address,
                                Latitude = bl.Latitude,
                                Longitude = bl.Longitude,
                                CreatedAt = bl.CreatedAt
                            }).ToList()

                    }).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: /api/users/{id}
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.BusinessUsers)
                .ThenInclude(b => b.BusinessLocations)
                .Where(u => u.Type != "Deleted")
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null || user.Type == "Deleted")
            {
                return NotFound();
            }

            return new UserDTO
            {
                UserId = user.UserId,
                Email = user.Email,
                UserName = user.UserName,
                Type = user.Type,
                IsVerified = user.IsVerified,
                ProfilePic = user.ProfilePic,
                Bio = user.Bio,
                CreatedAt = user.CreatedAt,
                ReputationPoints = user.ReputationPoints,
                UsersBusinesses = user.BusinessUsers
                    .Where(b => !b.IsDeleted)
                    .Select(b => new Business
                    {
                        BusinessId = b.BusinessId,
                        Name = b.Name,
                        BusinessLocations = b.BusinessLocations
                            .Where(bl => !b.IsDeleted)
                            .Select(bl => new BusinessLocation
                            {
                                LocationId = bl.LocationId,
                                Label = bl.Label,
                                Address = bl.Address,
                                Latitude = bl.Latitude,
                                Longitude = bl.Longitude,
                                CreatedAt = bl.CreatedAt
                            }).ToList()
                    }).ToList()
            };
        }

        // PUT: /api/users/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserDTO updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.UserName = updateUserDto.UserName;
            user.Bio = updateUserDto.Bio;
            user.ProfilePic = updateUserDto.ProfilePic;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: /api/users/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.
                Include(u => u.UsersBusinesses)
                .FirstOrDefaultAsync(u => u.UserId == id && u.Type != "Deleted");
            if (user == null)
            {
                return NotFound();
            }

            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            if (user.UserId != currentUserId && !isAdmin)
                return Forbid();

            user.Type = "Deleted"; // Mark as deleted
            user.UsersBusinesses.ToList().ForEach(b => b.IsDeleted = true); // Soft delete associated businesses
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: /api/users/me
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDTO>> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users
                .Include(u => u.BusinessUsers)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null || user.Type == "Deleted")
            {
                return NotFound();
            }

            return new UserDTO
            {
                UserId = user.UserId,
                Email = user.Email,
                UserName = user.UserName,
                Type = user.Type,
                IsVerified = user.IsVerified,
                ProfilePic = user.ProfilePic,
                Bio = user.Bio,
                CreatedAt = user.CreatedAt,
                ReputationPoints = user.ReputationPoints,
                UsersBusinesses = user.BusinessUsers
                    .Where(b => !b.IsDeleted)
                    .Select(b => new Business
                    {
                        BusinessId = b.BusinessId,
                        Name = b.Name,
                        BusinessLocations = b.BusinessLocations
                            .Where(bl => !b.IsDeleted)
                            .Select(bl => new BusinessLocation
                            {
                                LocationId = bl.LocationId,
                                Label = bl.Label,
                                Address = bl.Address,
                                Latitude = bl.Latitude,
                                Longitude = bl.Longitude,
                                CreatedAt = bl.CreatedAt
                            }).ToList()
                    }).ToList()
            };
        }
    }

}
