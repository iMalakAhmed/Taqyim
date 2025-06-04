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
                .Where(u => u.Type != "Deleted") 
                .Select(u => new
                {
                    u.UserId,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.Type,
                    u.ProfilePic,
                    u.Bio,
                    u.ReputationPoints,
                    u.CreatedAt
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
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound();
            }

            return new UserDTO
            {
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Type = user.Type,
                IsVerified = user.IsVerified,
                ProfilePic = user.ProfilePic,
                Bio = user.Bio,
                CreatedAt = user.CreatedAt,
                ReputationPoints = user.ReputationPoints
            };
        }

        // PUT: /api/users/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDTO updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = updateUserDto.FirstName;
            user.LastName = updateUserDto.LastName;
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
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            if (user.UserId != currentUserId && !isAdmin)
                return Forbid();

            user.Type = "Deleted"; // Mark as deleted
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

}
