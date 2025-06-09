using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Taqyim.Api.Data;
using Taqyim.Api.DTOs;
using Taqyim.Api.Models;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConnectionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ConnectionController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost("follow")]
    public async Task<IActionResult> Follow([FromBody] FollowRequest request)
    {
        var followerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Try to find if the follower is a user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == followerId && u.Type != "Deleted");
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.Owner.UserId == followerId && !b.IsDeleted);

        string followerType;
        int? businessFollowerId = null;
        int? userFollowerId = null;

        if (user != null)
        {
            followerType = "User";
            userFollowerId = followerId;
        }
        else if (business != null)
        {
            followerType = "Business";
            businessFollowerId = business.BusinessId;
        }
        else
        {
            return Forbid("Unable to identify follower.");
        }

        // Prevent following oneself
        if ((request.FollowingType == followerType) &&
            ((request.FollowingType == "User" && request.FollowingId == followerId) ||
            (request.FollowingType == "Business" && businessFollowerId == request.FollowingId)))
        {
            return BadRequest("You cannot follow yourself.");
        }

        // Check for existing connection
        var existingConnection = await _context.Connections.FirstOrDefaultAsync(c =>
            c.FollowerType == followerType &&
            c.FollowingType == request.FollowingType &&
            c.FollowerId == userFollowerId &&
            c.BusinessFollowerId == businessFollowerId &&
            c.FollowingId == (request.FollowingType == "User" || request.FollowingType == "Admin" || request.FollowingType == "Moderator" || request.FollowingType == "BusinessOwner"? request.FollowingId : null)
            && c.BusinessFollowingId == (request.FollowingType == "Business" ? request.FollowingId : null)

        );

        if (existingConnection != null)
        {
            return BadRequest("You are already following this entity.");
        }

        var connection = new Connection
        {
            FollowerType = followerType,
            FollowingType = request.FollowingType,
            CreatedAt = DateTime.UtcNow,
            FollowerId = userFollowerId,
            BusinessFollowerId = businessFollowerId,
            FollowingId = request.FollowingType == "User" ? request.FollowingId : null,
            BusinessFollowingId = request.FollowingType == "Business" ? request.FollowingId : null
        };

        _context.Connections.Add(connection);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Followed successfully" });
    }

    [Authorize]
    [HttpPost("unfollow")]
    public async Task<IActionResult> Unfollow([FromBody] FollowRequest request)
    {
        var followerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Normalize type input
        var normalizedType = request.FollowingType.Trim().ToLower() switch
        {
            "user" => "User",
            "business" => "Business",
            _ => null
        };

        if (normalizedType == null)
            return BadRequest("Invalid following type.");

        var connection = await _context.Connections
            .FirstOrDefaultAsync(c =>
                c.FollowerId == followerId &&
                c.FollowingType == normalizedType &&
                c.FollowingId == (normalizedType == "User" ? request.FollowingId : null) &&
                c.BusinessFollowingId == (normalizedType == "Business" ? request.FollowingId : null)
            );

        if (connection == null)
            return NotFound("Connection not found.");

        _context.Connections.Remove(connection);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Unfollowed successfully" });
    }


    [HttpGet("followers/{entityId}")]
    public async Task<ActionResult<IEnumerable<ConnectionDTO>>> GetFollowers(int entityId, [FromQuery] string type)
    {
        var connections = await _context.Connections
            .Where(c => c.FollowingId == entityId && c.FollowingType == type)
            .ToListAsync();

        var result = new List<ConnectionDTO>();

        foreach (var conn in connections)
        {
            var dto = new ConnectionDTO
            {
                ConnectionId = conn.ConnectionId,
                UserId = conn.FollowerId??0,
                ConnectedUserId = conn.FollowingId??0,
                CreatedAt = conn.CreatedAt,
                FollowerType = conn.FollowerType,
                FollowingType = conn.FollowingType
            };

            if (conn.FollowerType == "User")
            {
                var user = await _context.Users.FindAsync(conn.FollowerId);
                if (user != null)
                {
                    dto.User = new UserDTO
                    {
                        UserId = user.UserId,
                        Email = user.Email,
                        UserName = user.UserName,
                        Type = user.Type,
                        IsVerified = user.IsVerified,
                        ProfilePic = user.ProfilePic,
                        Bio = user.Bio,
                        CreatedAt = user.CreatedAt,
                        ReputationPoints = user.ReputationPoints
                    };
                }
            }
            else if (conn.FollowerType == "Business")
            {
                var business = await _context.Businesses.FindAsync(conn.FollowerId);
                if (business != null)
                {
                    dto.UserBusiness = new BusinessDTO
                    {
                        BusinessId = business.BusinessId,
                        Name = business.Name,
                        Description = business.Description,
                        Category = business.Category,
                        CreatedAt = business.CreatedAt,
                        BusinessLocations = business.BusinessLocations.Select(bl => new BusinessLocationDTO
                        {
                            LocationId = bl.LocationId,
                            Label = bl.Label,
                            Address = bl.Address,
                            Latitude = (double?)bl.Latitude,
                            Longitude = (double?)bl.Longitude,
                            CreatedAt = bl.CreatedAt ?? DateTime.UtcNow
                        }).ToList()
                    };
                }
            }

            result.Add(dto);
        }

        return Ok(result);
    }

    [HttpGet("following/{entityId}")]
    public async Task<ActionResult<IEnumerable<ConnectionDTO>>> GetFollowing(int entityId, [FromQuery] string type)
    {
        var connections = await _context.Connections
            .Where(c => c.FollowerId == entityId && c.FollowerType == type)
            .ToListAsync();

        var result = new List<ConnectionDTO>();

        foreach (var conn in connections)
        {
            var dto = new ConnectionDTO
            {
                ConnectionId = conn.ConnectionId,
                UserId = conn.FollowerId??0,
                ConnectedUserId = conn.FollowingId??0,
                CreatedAt = conn.CreatedAt,
                FollowerType = conn.FollowerType,
                FollowingType = conn.FollowingType
            };

            if (conn.FollowingType == "User")
            {
                var user = await _context.Users.FindAsync(conn.FollowingId);
                if (user != null)
                {
                    dto.ConnectedUser = new UserDTO
                    {
                        UserId = user.UserId,
                        Email = user.Email,
                        UserName = user.UserName,
                        Type = user.Type,
                        IsVerified = user.IsVerified,
                        ProfilePic = user.ProfilePic,
                        Bio = user.Bio,
                        CreatedAt = user.CreatedAt,
                        ReputationPoints = user.ReputationPoints
                    };
                }
            }
            else if (conn.FollowingType == "Business")
            {
                var business = await _context.Businesses.FindAsync(conn.FollowingId);
                if (business != null)
                {
                    dto.connectedBusiness = new BusinessDTO
                    {
                        BusinessId = business.BusinessId,
                        Name = business.Name,
                        Description = business.Description,
                        Category = business.Category,
                        CreatedAt = business.CreatedAt,
                        BusinessLocations = business.BusinessLocations.Select(bl => new BusinessLocationDTO
                        {
                            LocationId = bl.LocationId,
                            Label = bl.Label,
                            Address = bl.Address,
                            Latitude = (double?)bl.Latitude,
                            Longitude = (double?)bl.Longitude,
                            CreatedAt = bl.CreatedAt ?? DateTime.UtcNow
                        }).ToList()
                    };
                }
            }

            result.Add(dto);
        }

        return Ok(result);
    }
}
