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
        var followers = await _context.Connections
            .Include(c => c.Follower)
            .Where(c => c.FollowingId == userId)
            .Select(c => new ConnectionDTO
            {
                ConnectionId = c.ConnectionId,
                FollowerId = c.FollowerId,
                FollowingId = c.FollowingId,
                CreatedAt = c.CreatedAt,
                Follower = new UserDTO
                {
                    Id = c.Follower.Id,
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
                Following = new UserDTO
                {
                    Id = c.Following.Id,
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

        return followers;
    }

    [HttpGet("following/{userId}")]
    public async Task<ActionResult<IEnumerable<ConnectionDTO>>> GetFollowing(int userId)
    {
        var following = await _context.Connections
            .Include(c => c.Following)
            .Where(c => c.FollowerId == userId)
            .Select(c => new ConnectionDTO
            {
                ConnectionId = c.ConnectionId,
                FollowerId = c.FollowerId,
                FollowingId = c.FollowingId,
                CreatedAt = c.CreatedAt,
                Follower = new UserDTO
                {
                    Id = c.Follower.Id,
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
                Following = new UserDTO
                {
                    Id = c.Following.Id,
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

        return following;
    }
} 