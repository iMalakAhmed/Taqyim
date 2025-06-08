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
            .Include(b => b.Owner)
            .Include(b => b.BusinessLocations)
            .Where(b => !b.IsDeleted && (
                b.Name.ToLower().Contains(searchTerm) ||
                b.Category.ToString().ToLower().Contains(searchTerm) ||
                (b.Category == BusinessCategory.Other && b.CustomCategory != null && b.CustomCategory.ToLower().Contains(searchTerm)) ||
                b.Description.ToLower().Contains(searchTerm) ||
                b.BusinessLocations.Any(l => l.Address.ToLower().Contains(searchTerm))
            ))
            .Select(b => new BusinessDTO
            {
                BusinessId = b.BusinessId,
                Name = b.Name,
                Category = b.Category,
                CustomCategory = b.CustomCategory,
                Description = b.Description,
                CreatedAt = b.CreatedAt,
                Owner = new UserDTO
                {
                    UserId = b.Owner.UserId,
                    Email = b.Owner.Email,
                    UserName = b.Owner.UserName,
                    Type = b.Owner.Type,
                    IsVerified = b.Owner.IsVerified,
                    ProfilePic = b.Owner.ProfilePic,
                    Bio = b.Owner.Bio,
                    CreatedAt = b.Owner.CreatedAt,
                    ReputationPoints = b.Owner.ReputationPoints
                },
                VerifiedByUser = b.VerifiedByUser != null ? new UserDTO
                {
                    UserId = b.VerifiedByUser.UserId,
                    Email = b.VerifiedByUser.Email,
                    UserName = b.VerifiedByUser.UserName,
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
            .Where(u => u.Type != "Deleted" && (
                u.UserName.ToLower().Contains(searchTerm) ||
                u.Email.ToLower().Contains(searchTerm)
            ))
            .Select(u => new UserDTO
            {
                UserId = u.UserId,
                Email = u.Email,
                UserName = u.UserName,
                Type = u.Type,
                IsVerified = u.IsVerified,
                ProfilePic = u.ProfilePic,
                Bio = u.Bio,
                CreatedAt = u.CreatedAt,
                ReputationPoints = u.ReputationPoints
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
            var loweredQuery = query.ToLower();
            businesses = businesses.Where(b =>
                b.Name.ToLower().Contains(loweredQuery) ||
                b.Description.ToLower().Contains(loweredQuery) ||
                (b.Category == BusinessCategory.Other && b.CustomCategory != null && b.CustomCategory.ToLower().Contains(loweredQuery)));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            if (Enum.TryParse<BusinessCategory>(category, true, out var parsedCategory))
            {
                businesses = businesses.Where(b => b.Category == parsedCategory);
            }
            else
            {
                var loweredCategory = category.ToLower();
                businesses = businesses.Where(b => b.Category == BusinessCategory.Other && b.CustomCategory != null && b.CustomCategory.ToLower().Contains(loweredCategory));
            }
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
                Category = b.Category == BusinessCategory.Other && b.CustomCategory != null
                ? b.CustomCategory
                : b.Category.ToString(),
                Description = b.Description,
                CreatedAt = b.CreatedAt,
                BusinessLocations = b.BusinessLocations.Select(l => new BusinessLocationDTO
                {
                    LocationId = l.LocationId,
                    BusinessId = l.BusinessId,
                    Address = l.Address,
                    Latitude = (double?)l.Latitude,
                    Longitude = (double?)l.Longitude,
                    Label = l.Label,
                    CreatedAt = l.CreatedAt ?? DateTime.UtcNow
                }).ToList(),
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
                u.UserName.Contains(query) || 
                u.Email.Contains(query));
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            users = users.Where(u => u.Type == type);
        }

        var results = await users
            .Select(u => new SearchUserDTO
            {
                UserId = u.UserId,
                UserName = u.UserName,
                Email = u.Email,
                Type = u.Type,
                ProfilePic = u.ProfilePic
            })
            .ToListAsync();

        return Ok(results);
    }

    [HttpGet("reviews")]
    public async Task<ActionResult<IEnumerable<SearchReviewDTO>>> SearchReviews(
        [FromQuery] string? query,
        [FromQuery] int? minRating,
        [FromQuery] int? maxRating,
        [FromQuery] string? businessName,
        [FromQuery] string? userName,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var reviews = _context.Reviews
            .Include(r => r.Business)
            .Include(r => r.User)
            .Include(r => r.Comments)
            .Include(r => r.Reactions)
            .Include(r => r.Tags)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            reviews = reviews.Where(r => 
                r.Comment.Contains(query) ||
                r.Tags.Any(t => t.TagType.Contains(query)));
        }

        if (minRating.HasValue)
        {
            reviews = reviews.Where(r => r.Rating >= minRating.Value);
        }

        if (maxRating.HasValue)
        {
            reviews = reviews.Where(r => r.Rating <= maxRating.Value);
        }

        if (!string.IsNullOrWhiteSpace(businessName))
        {
            reviews = reviews.Where(r => r.Business.Owner.UserName.Contains(businessName));
        }

        if (!string.IsNullOrWhiteSpace(userName))
        {
            reviews = reviews.Where(r => 
                r.User.UserName.Contains(userName));
        }

        if (fromDate.HasValue)
        {
            reviews = reviews.Where(r => r.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            reviews = reviews.Where(r => r.CreatedAt <= toDate.Value);
        }

        var results = await reviews
            .Select(r => new SearchReviewDTO
            {
                ReviewId = r.ReviewId,
                Comment = r.Comment,
                Rating = r.Rating,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                BusinessName = r.Business.Name,
                BusinessId = r.BusinessId,
                UserName = $"{r.User.UserName}",
                UserId = r.UserId,
                UserProfilePic = r.User.ProfilePic,
                CommentsCount = r.Comments.Count,
                ReactionsCount = r.Reactions.Count,
                Tags = r.Tags.Select(t => t.TagType).ToList()
            })
            .ToListAsync();

        return Ok(results);
    }

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