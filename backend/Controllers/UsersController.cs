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
                    u.Id,
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
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.Type == "Deleted")
                return NotFound();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Type,
                user.ProfilePic,
                user.Bio,
                user.ReputationPoints,
                user.CreatedAt
            });
        }

        // PUT: /api/users/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.Type == "Deleted")
                return NotFound();

            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            if (user.Id != currentUserId && !isAdmin)
                return Forbid();

            user.FirstName = dto.FirstName ?? user.FirstName;
            user.LastName = dto.LastName ?? user.LastName;
            user.Bio = dto.Bio ?? user.Bio;
            user.ProfilePic = dto.ProfilePic ?? user.ProfilePic;

            await _context.SaveChangesAsync();

            return Ok(new { message = "User updated successfully." });
        }

        // DELETE: /api/users/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.Type == "Deleted")
                return NotFound();

            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            if (user.Id != currentUserId && !isAdmin)
                return Forbid();

            user.Type = "Deleted"; // Mark as deleted
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

}
