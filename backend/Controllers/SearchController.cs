using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.DTOs;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SearchController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<SearchResultDTO>> Search([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Search query cannot be empty");
        }

        var searchTerm = query.ToLower();

        var businesses = await _context.Businesses
            .Include(b => b.User)
            .Include(b => b.BusinessLocations)
            .Where(b => !b.IsDeleted && (
                b.Name.ToLower().Contains(searchTerm) ||
                b.Category.ToLower().Contains(searchTerm) ||
                b.Description.ToLower().Contains(searchTerm) ||
                b.BusinessLocations.Any(l => l.Address.ToLower().Contains(searchTerm))
            ))
            .Select(b => new BusinessDTO
            {
                BusinessId = b.BusinessId,
                UserId = b.UserId,
                Location = b.Location,
                Name = b.Name,
                Category = b.Category,
                Description = b.Description,
                VerifiedByUserId = b.VerifiedByUserId,
                CreatedAt = b.CreatedAt,
                User = new UserDTO
                {
                    Id = b.User.Id,
                    Email = b.User.Email,
                    FirstName = b.User.FirstName,
                    LastName = b.User.LastName,
                    Type = b.User.Type,
                    IsVerified = b.User.IsVerified,
                    ProfilePic = b.User.ProfilePic,
                    Bio = b.User.Bio,
                    CreatedAt = b.User.CreatedAt,
                    ReputationPoints = b.User.ReputationPoints
                },
                VerifiedByUser = b.VerifiedByUser != null ? new UserDTO
                {
                    Id = b.VerifiedByUser.Id,
                    Email = b.VerifiedByUser.Email,
                    FirstName = b.VerifiedByUser.FirstName,
                    LastName = b.VerifiedByUser.LastName,
                    Type = b.VerifiedByUser.Type,
                    IsVerified = b.VerifiedByUser.IsVerified,
                    ProfilePic = b.VerifiedByUser.ProfilePic,
                    Bio = b.VerifiedByUser.Bio,
                    CreatedAt = b.VerifiedByUser.CreatedAt,
                    ReputationPoints = b.VerifiedByUser.ReputationPoints
                } : null!,
                BusinessLocations = b.BusinessLocations.Select(l => new BusinessLocationDTO
                {
                    LocationId = l.LocationId,
                    BusinessId = l.BusinessId,
                    Address = l.Address,
                    Latitude = (double?)l.Latitude,
                    Longitude = (double?)l.Longitude,
                    Label = l.Label,
                    CreatedAt = l.CreatedAt ?? DateTime.UtcNow
                }).ToList()
            })
            .ToListAsync();

        var users = await _context.Users
            .Where(u => !u.IsDeleted && (
                u.FirstName.ToLower().Contains(searchTerm) ||
                u.LastName.ToLower().Contains(searchTerm) ||
                u.Email.ToLower().Contains(searchTerm)
            ))
            .Select(u => new UserDTO
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Type = u.Type
            })
            .ToListAsync();

        return new SearchResultDTO
        {
            Businesses = businesses,
            Users = users
        };
    }

    [HttpGet("businesses")]
    public async Task<ActionResult<IEnumerable<SearchBusinessDTO>>> SearchBusinesses(
        [FromQuery] string? query,
        [FromQuery] string? category,
        [FromQuery] double? latitude,
        [FromQuery] double? longitude,
        [FromQuery] double? radius)
    {
        var businesses = _context.Businesses
            .Include(b => b.BusinessLocations)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            businesses = businesses.Where(b => 
                b.Name.Contains(query) || 
                b.Description.Contains(query));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            businesses = businesses.Where(b => b.Category == category);
        }

        if (latitude.HasValue && longitude.HasValue && radius.HasValue)
        {
            businesses = businesses.Where(b => 
                b.BusinessLocations.Any(l => 
                    CalculateDistance(
                        latitude.Value, 
                        longitude.Value, 
                        (double)l.Latitude!, 
                        (double)l.Longitude!) <= radius.Value));
        }

        var results = await businesses
            .Select(b => new SearchBusinessDTO
            {
                BusinessId = b.BusinessId,
                Name = b.Name,
                Category = b.Category,
                Description = b.Description,
                Location = b.Location,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(results);
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<SearchUserDTO>>> SearchUsers(
        [FromQuery] string? query,
        [FromQuery] string? type)
    {
        var users = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            users = users.Where(u => 
                u.FirstName.Contains(query) || 
                u.LastName.Contains(query) || 
                u.Email.Contains(query));
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            users = users.Where(u => u.Type == type);
        }

        var results = await users
            .Select(u => new SearchUserDTO
            {
                UserId = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Type = u.Type,
                ProfilePic = u.ProfilePic
            })
            .ToListAsync();

        return Ok(results);
    }

    // Temporarily commented out review search endpoint
    /*
    [HttpGet("reviews")]
    public async Task<ActionResult<IEnumerable<SearchReviewDTO>>> SearchReviews(
        [FromQuery] string? query,
        [FromQuery] int? minRating,
        [FromQuery] int? maxRating)
    {
        var reviews = _context.Reviews
            .Include(r => r.Business)
            .Include(r => r.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            reviews = reviews.Where(r => 
                r.Comment.Contains(query));
        }

        if (minRating.HasValue)
        {
            reviews = reviews.Where(r => r.Rating >= minRating.Value);
        }

        if (maxRating.HasValue)
        {
            reviews = reviews.Where(r => r.Rating <= maxRating.Value);
        }

        var results = await reviews
            .Select(r => new SearchReviewDTO
            {
                ReviewId = r.ReviewId,
                Comment = r.Comment,
                Rating = r.Rating,
                CreatedAt = r.CreatedAt,
                BusinessName = r.Business.Name,
                UserName = $"{r.User.FirstName} {r.User.LastName}"
            })
            .ToListAsync();

        return Ok(results);
    }
    */

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double EarthRadiusKm = 6371;
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return EarthRadiusKm * c;
    }

    private double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
} 