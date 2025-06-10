using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.Services;
namespace Taqyim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(ApplicationDbContext context, IJwtService jwtService)
        {
            _context=context;
            _jwtService=jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            Console.WriteLine("Step 1: Starting registration");

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { message = "Validation failed", errors });
            }

            Console.WriteLine("Step 2: Validation passed");

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            Console.WriteLine("Step 3: Email is unique");

            var user = new User
            {
                Email = request.Email,
                UserName = request.UserName,
                PasswordHash = HashPassword(request.Password),
                Type = request.Type,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            Console.WriteLine("Step 4: User created");

            if (request.Type == "Business")
            {
                var business = new Business
                {
                    UserId = user.UserId,
                    CreatedAt = DateTime.UtcNow,
                };

                _context.Businesses.Add(business);
                await _context.SaveChangesAsync();

                Console.WriteLine("Step 5: Business created");
            }

            var token = _jwtService.GenerateToken(user);

            Console.WriteLine("Step 6: Token generated");

            return Ok(new
            {
                token,
                user = new {
                    id = user.UserId,
                    email = user.Email,
                    userName = user.UserName
                }
            });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user=await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Type != "Deleted");
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password");
            }
            var token=_jwtService.GenerateToken(user);
            return Ok(new { token });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId=int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users
                .Include(u => u.UsersBusinesses)
                .FirstOrDefaultAsync(u => u.UserId == userId);
            
            if (user==null)
                return NotFound();

            return Ok(new
            {
                user.UserId,
                user.Email,
                user.UserName,
                user.Type,
                UsersBusinesses = user.UsersBusinesses?.Select(b => new { b.BusinessId, b.Name }).ToList()
            });
        }

        [HttpPost("signout")]
        public new IActionResult SignOut()
        {
            Response.Cookies.Delete("token");
            return Ok();
        }

        private string HashPassword(string password)
        {
            using var sha256=SHA256.Create();
            var hashedBytes=sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password)==hash;
        }
    }

    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }=string.Empty;
        
        [Required]
        public string Password { get; set; }=string.Empty;

        [Required]
        public string UserName { get; set; }=string.Empty;

        public string? Type { get; set; }
        
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }=string.Empty;
        
        [Required]
        public string Password { get; set; }=string.Empty;
    }
} 