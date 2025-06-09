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
                                Latitude = bl.Latitude != null ? (decimal?)bl.Latitude : null,
                                Longitude = bl.Longitude != null ? (decimal?)bl.Longitude : null,
                                CreatedAt = bl.CreatedAt ?? DateTime.MinValue
                            }).ToList(),

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
                .Include(u => u.BusinessUsers).ThenInclude(b => b.BusinessLocations)
                .Include(u => u.ConnectionFollowers).ThenInclude(cf => cf.Follower)
                .Include(u => u.ConnectionFollowers).ThenInclude(cf => cf.BusinessFollower)
                .Include(u => u.ConnectionFollowings).ThenInclude(cf => cf.Following)
                .Include(u => u.ConnectionFollowings).ThenInclude(cf => cf.BusinessFollowing)
                .Where(u => u.Type != "Deleted")
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null || user.Type == "Deleted")
                return NotFound();
            var followerCount = await _context.Connections
                .CountAsync(c => c.FollowingType == "User" && c.FollowingId == user.UserId);

            var followingCount = await _context.Connections
                .CountAsync(c => c.FollowerType == "User" && c.FollowerId == user.UserId);

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
                FollowerCount = followerCount,
                FollowingCount = followingCount,
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
                                Latitude = bl.Latitude != null ? (decimal?)bl.Latitude : null,
                                Longitude = bl.Longitude != null ? (decimal?)bl.Longitude : null,
                                CreatedAt = bl.CreatedAt ?? DateTime.MinValue
                            }).ToList()
                    }).ToList(),
                ConnectionFollowers = user.ConnectionFollowers.Select(cf => new ConnectionDTO
                {
                    ConnectionId = cf.ConnectionId,
                    FollowerType = cf.FollowerType,
                    FollowingType = cf.FollowingType,
                    UserId = cf.FollowerId ?? 0,
                    ConnectedUserId = cf.FollowingId ?? 0,
                    BusinessFollowerId = cf.BusinessFollowerId,
                    BusinessFollowingId = cf.BusinessFollowingId,
                    CreatedAt = cf.CreatedAt,
                    User = cf.Follower != null ? new UserDTO
                    {
                        UserId = cf.Follower.UserId,
                        UserName = cf.Follower.UserName,
                        ProfilePic = cf.Follower.ProfilePic
                    } : null,
                    UserBusiness = cf.BusinessFollower != null ? new BusinessDTO
                    {
                        BusinessId = cf.BusinessFollower.BusinessId,
                        Name = cf.BusinessFollower.Name,
                        Logo = cf.BusinessFollower.Logo,
                        Category = cf.BusinessFollower.Category,
                        Description = cf.BusinessFollower.Description,
                        CreatedAt = cf.BusinessFollower.CreatedAt,
                        BusinessLocations = cf.BusinessFollower.BusinessLocations.Select(bl => new BusinessLocationDTO
                        {
                            LocationId = bl.LocationId,
                            Label = bl.Label,
                            Address = bl.Address,
                            Latitude = (double?)bl.Latitude,
                            Longitude = (double?)bl.Longitude,
                            CreatedAt = bl.CreatedAt ?? DateTime.MinValue
                        }).ToList()

                    } : null
                }).ToList(),
                ConnectionFollowings = user.ConnectionFollowings.Select(cf => new ConnectionDTO
                {
                    ConnectionId = cf.ConnectionId,
                    FollowerType = cf.FollowerType,
                    FollowingType = cf.FollowingType,
                    UserId = cf.FollowerId ?? 0,
                    ConnectedUserId = cf.FollowingId ?? 0,
                    BusinessFollowerId = cf.BusinessFollowerId,
                    BusinessFollowingId = cf.BusinessFollowingId,
                    CreatedAt = cf.CreatedAt,
                    User = cf.Following != null ? new UserDTO
                    {
                        UserId = cf.Following.UserId,
                        UserName = cf.Following.UserName,
                        ProfilePic = cf.Following.ProfilePic,

                    } : null,
                    UserBusiness = cf.BusinessFollowing != null ? new BusinessDTO
                    {
                        BusinessId = cf.BusinessFollowing.BusinessId,
                        Name = cf.BusinessFollowing.Name,
                        Logo = cf.BusinessFollowing.Logo,
                        Category = cf.BusinessFollowing.Category,
                        Description = cf.BusinessFollowing.Description,
                        CreatedAt = cf.BusinessFollowing.CreatedAt,
                        BusinessLocations = cf.BusinessFollowing.BusinessLocations.Select(bl => new BusinessLocationDTO
                        {
                            LocationId = bl.LocationId,
                            Label = bl.Label,
                            Address = bl.Address,
                            Latitude = (double?)bl.Latitude,
                            Longitude = (double?)bl.Longitude,
                            CreatedAt = bl.CreatedAt ?? DateTime.MinValue
                        }).ToList()
                    } : null
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
                .Include(u => u.BusinessUsers).ThenInclude(b => b.BusinessLocations)
                .Include(u => u.ConnectionFollowers).ThenInclude(cf => cf.Follower)
                .Include(u => u.ConnectionFollowers).ThenInclude(cf => cf.BusinessFollower)
                .Include(u => u.ConnectionFollowings).ThenInclude(cf => cf.Following)
                .Include(u => u.ConnectionFollowings).ThenInclude(cf => cf.BusinessFollowing)
                .Where(u => u.Type != "Deleted")
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null || user.Type == "Deleted")
            {
                return NotFound();
            }
            var followerCount = await _context.Connections
                .CountAsync(c => c.FollowingType == "User" && c.FollowingId == user.UserId);

            var followingCount = await _context.Connections
                .CountAsync(c => c.FollowerType == "User" && c.FollowerId == user.UserId);

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
                FollowerCount = followerCount,
                FollowingCount = followingCount,
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
                    }).ToList(),
                ConnectionFollowers = user.ConnectionFollowers.Select(cf => new ConnectionDTO
                {
                    ConnectionId = cf.ConnectionId,
                    FollowerType = cf.FollowerType,
                    FollowingType = cf.FollowingType,
                    UserId = cf.FollowerId ?? 0,
                    ConnectedUserId = cf.FollowingId ?? 0,
                    BusinessFollowerId = cf.BusinessFollowerId,
                    BusinessFollowingId = cf.BusinessFollowingId,
                    CreatedAt = cf.CreatedAt,
                    User = cf.Follower != null ? new UserDTO
                    {
                        UserId = cf.Follower.UserId,
                        UserName = cf.Follower.UserName,
                        ProfilePic = cf.Follower.ProfilePic
                    } : null,
                    UserBusiness = cf.BusinessFollower != null ? new BusinessDTO
                    {
                        BusinessId = cf.BusinessFollower.BusinessId,
                        Name = cf.BusinessFollower.Name,
                        Logo = cf.BusinessFollower.Logo,
                        Category = cf.BusinessFollower.Category,
                        Description = cf.BusinessFollower.Description,
                        CreatedAt = cf.BusinessFollower.CreatedAt,
                        BusinessLocations = cf.BusinessFollower.BusinessLocations.Select(bl => new BusinessLocationDTO
                        {
                            LocationId = bl.LocationId,
                            Label = bl.Label,
                            Address = bl.Address,
                            Latitude = (double?)bl.Latitude,
                            Longitude = (double?)bl.Longitude,
                            CreatedAt = bl.CreatedAt ?? DateTime.MinValue
                        }).ToList()

                    } : null
                }).ToList(),
                ConnectionFollowings = user.ConnectionFollowings.Select(cf => new ConnectionDTO
                {
                    ConnectionId = cf.ConnectionId,
                    FollowerType = cf.FollowerType,
                    FollowingType = cf.FollowingType,
                    UserId = cf.FollowerId ?? 0,
                    ConnectedUserId = cf.FollowingId ?? 0,
                    BusinessFollowerId = cf.BusinessFollowerId,
                    BusinessFollowingId = cf.BusinessFollowingId,
                    CreatedAt = cf.CreatedAt,
                    User = cf.Following != null ? new UserDTO
                    {
                        UserId = cf.Following.UserId,
                        UserName = cf.Following.UserName,
                        ProfilePic = cf.Following.ProfilePic
                    } : null,
                    UserBusiness = cf.BusinessFollowing != null ? new BusinessDTO
                    {
                        BusinessId = cf.BusinessFollowing.BusinessId,
                        Name = cf.BusinessFollowing.Name,
                        Logo = cf.BusinessFollowing.Logo,
                        Category = cf.BusinessFollowing.Category,
                        Description = cf.BusinessFollowing.Description,
                        CreatedAt = cf.BusinessFollowing.CreatedAt,
                        BusinessLocations = cf.BusinessFollowing.BusinessLocations.Select(bl => new BusinessLocationDTO
                        {
                            LocationId = bl.LocationId,
                            Label = bl.Label,
                            Address = bl.Address,
                            Latitude = (double?)bl.Latitude,
                            Longitude = (double?)bl.Longitude,
                            CreatedAt = bl.CreatedAt ?? DateTime.MinValue
                        }).ToList()
                    } : null
                }).ToList()
            };
        }
    }

}
