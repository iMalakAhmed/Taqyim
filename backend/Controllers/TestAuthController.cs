using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;

namespace Taqyim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestAuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestAuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("public")]
        public IActionResult PublicEndpoint()
        {
            return Ok("This is a public endpoint - anyone can access it!");
        }

        [Authorize]
        [HttpGet("protected")]
        public IActionResult ProtectedEndpoint()
        {
            return Ok("This is a protected endpoint - only authenticated users can access it!");
        }

        [Authorize]
        [HttpGet("user-info")]
        public IActionResult GetUserInfo()
        {
            var userId=User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email=User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name=User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value;

            return Ok(new
            {
                Message="You are authenticated!",
                UserId=userId,
                Email=email,
                Name=name
            });
        }

        [HttpGet("db-test")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                bool canConnect=await _context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    return StatusCode(500, "Cannot connect to the database");
                }

                var tables=await _context.Database.SqlQueryRaw<string>(
                    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
                ).ToListAsync();
                var entityCounts=new Dictionary<string, int>
                {
                    { "Users", await _context.Users.CountAsync() },
                    { "Businesses", await _context.Businesses.CountAsync() },
                    { "Reviews", await _context.Reviews.CountAsync() },
                    { "Comments", await _context.Comments.CountAsync() },
                    { "Badges", await _context.Badges.CountAsync() }
                };

                return Ok(new
                {
                    Status="Database connection successful",
                    Tables=tables,
                    EntityCounts=entityCounts
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Status="Error testing database",
                    Message=ex.Message,
                    StackTrace=ex.StackTrace
                });
            }
        }
    }
} 