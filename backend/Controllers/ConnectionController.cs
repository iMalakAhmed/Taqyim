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
    [HttpPost("follow/{userId}")]
    public async Task<IActionResult> FollowUser(int userId)
    {
        var followerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        if (followerId == userId)
            return BadRequest("You cannot follow yourself");

        var existingConnection = await _context.Connections
            .FirstOrDefaultAsync(c => c.FollowerId == followerId && c.FollowingId == userId);

        if (existingConnection != null)
            return BadRequest("You are already following this user");

        var connection = new Connection
        {
            FollowerId = followerId,
            FollowingId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Connections.Add(connection);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User followed successfully" });
    }

    [Authorize]
    [HttpDelete("unfollow/{userId}")]
    public async Task<IActionResult> UnfollowUser(int userId)
    {
        var followerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var connection = await _context.Connections
            .FirstOrDefaultAsync(c => c.FollowerId == followerId && c.FollowingId == userId);

        if (connection == null)
            return NotFound("Connection not found");

        _context.Connections.Remove(connection);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User unfollowed successfully" });
    }

    [HttpGet("followers/{userId}")]
    public async Task<ActionResult<IEnumerable<ConnectionDTO>>> GetFollowers(int userId)
    {
        var connections = await _context.Connections
            .Where(c => c.FollowingId == userId)
            .Include(c => c.Follower)
            .Select(c => new ConnectionDTO
            {
                ConnectionId = c.ConnectionId,
                UserId = c.FollowerId,
                ConnectedUserId = c.FollowingId,
                CreatedAt = c.CreatedAt,
                User = new UserDTO
                {
                    UserId = c.Follower.UserId,
                    Email = c.Follower.Email,
                    FirstName = c.Follower.FirstName,
                    LastName = c.Follower.LastName,
                    Type = c.Follower.Type,
                    IsVerified = c.Follower.IsVerified,
                    ProfilePic = c.Follower.ProfilePic,
                    Bio = c.Follower.Bio,
                    CreatedAt = c.Follower.CreatedAt,
                    ReputationPoints = c.Follower.ReputationPoints
                },
                ConnectedUser = new UserDTO
                {
                    UserId = c.FollowingId,
                    // Only ID is set for following, as navigation property is not needed here
                }
            })
            .ToListAsync();

        return connections;
    }

    [HttpGet("following/{userId}")]
    public async Task<ActionResult<IEnumerable<ConnectionDTO>>> GetFollowing(int userId)
    {
        var connections = await _context.Connections
            .Where(c => c.FollowerId == userId)
            .Include(c => c.Following)
            .Select(c => new ConnectionDTO
            {
                ConnectionId = c.ConnectionId,
                UserId = c.FollowerId,
                ConnectedUserId = c.FollowingId,
                CreatedAt = c.CreatedAt,
                User = new UserDTO
                {
                    UserId = c.FollowerId,
                    // Only ID is set for follower, as navigation property is not needed here
                },
                ConnectedUser = new UserDTO
                {
                    UserId = c.Following.UserId,
                    Email = c.Following.Email,
                    FirstName = c.Following.FirstName,
                    LastName = c.Following.LastName,
                    Type = c.Following.Type,
                    IsVerified = c.Following.IsVerified,
                    ProfilePic = c.Following.ProfilePic,
                    Bio = c.Following.Bio,
                    CreatedAt = c.Following.CreatedAt,
                    ReputationPoints = c.Following.ReputationPoints
                }
            })
            .ToListAsync();

        return connections;
    }
} 