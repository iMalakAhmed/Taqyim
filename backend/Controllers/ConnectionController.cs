using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.DTOs;
using Taqyim.Api.Models;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/users")]
public class ConnectionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ConnectionController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost("{userId}/follow")]
    public async Task<ActionResult<ConnectionDTO>> FollowUser(int userId, CreateConnectionDTO createConnectionDTO)
    {
        // Get the current user's ID from the token
        var currentUserId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        if (currentUserId == 0)
        {
            return Unauthorized();
        }

        // Check if trying to follow self
        if (currentUserId == createConnectionDTO.FollowingId)
        {
            return BadRequest("Cannot follow yourself");
        }

        // Check if user exists
        var followingUser = await _context.Users.FindAsync(createConnectionDTO.FollowingId);
        if (followingUser == null)
        {
            return NotFound("User to follow not found");
        }

        // Check if already following
        var existingConnection = await _context.Connections
            .FirstOrDefaultAsync(c => c.FollowerId == currentUserId && c.FollowingId == createConnectionDTO.FollowingId);

        if (existingConnection != null)
        {
            return BadRequest("Already following this user");
        }

        var connection = new Connection
        {
            FollowerId = currentUserId,
            FollowingId = createConnectionDTO.FollowingId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Connections.Add(connection);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFollowers), new { userId = currentUserId }, new ConnectionDTO
        {
            ConnectionId = connection.ConnectionId,
            FollowerId = connection.FollowerId,
            FollowingId = connection.FollowingId,
            CreatedAt = connection.CreatedAt,
            Follower = new UserDTO
            {
                Id = connection.Follower.Id,
                Email = connection.Follower.Email,
                FirstName = connection.Follower.FirstName,
                LastName = connection.Follower.LastName,
                Type = connection.Follower.Type,
                ProfilePic = connection.Follower.ProfilePic,
                Bio = connection.Follower.Bio,
                CreatedAt = connection.Follower.CreatedAt,
                ReputationPoints = connection.Follower.ReputationPoints
            },
            Following = new UserDTO
            {
                Id = connection.Following.Id,
                Email = connection.Following.Email,
                FirstName = connection.Following.FirstName,
                LastName = connection.Following.LastName,
                Type = connection.Following.Type,
                ProfilePic = connection.Following.ProfilePic,
                Bio = connection.Following.Bio,
                CreatedAt = connection.Following.CreatedAt,
                ReputationPoints = connection.Following.ReputationPoints
            }
        });
    }

    [Authorize]
    [HttpDelete("{userId}/unfollow")]
    public async Task<IActionResult> UnfollowUser(int userId, [FromQuery] int followingId)
    {
        // Get the current user's ID from the token
        var currentUserId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
        if (currentUserId == 0)
        {
            return Unauthorized();
        }

        var connection = await _context.Connections
            .FirstOrDefaultAsync(c => c.FollowerId == currentUserId && c.FollowingId == followingId);

        if (connection == null)
        {
            return NotFound("Connection not found");
        }

        _context.Connections.Remove(connection);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{userId}/followers")]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetFollowers(int userId)
    {
        var followers = await _context.Connections
            .Where(c => c.FollowingId == userId)
            .Include(c => c.Follower)
            .Select(c => new UserDTO
            {
                Id = c.Follower.Id,
                Email = c.Follower.Email,
                FirstName = c.Follower.FirstName,
                LastName = c.Follower.LastName,
                Type = c.Follower.Type,
                ProfilePic = c.Follower.ProfilePic,
                Bio = c.Follower.Bio,
                CreatedAt = c.Follower.CreatedAt,
                ReputationPoints = c.Follower.ReputationPoints
            })
            .ToListAsync();

        return Ok(followers);
    }

    [HttpGet("{userId}/following")]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetFollowing(int userId)
    {
        var following = await _context.Connections
            .Where(c => c.FollowerId == userId)
            .Include(c => c.Following)
            .Select(c => new UserDTO
            {
                Id = c.Following.Id,
                Email = c.Following.Email,
                FirstName = c.Following.FirstName,
                LastName = c.Following.LastName,
                Type = c.Following.Type,
                ProfilePic = c.Following.ProfilePic,
                Bio = c.Following.Bio,
                CreatedAt = c.Following.CreatedAt,
                ReputationPoints = c.Following.ReputationPoints
            })
            .ToListAsync();

        return Ok(following);
    }
} 