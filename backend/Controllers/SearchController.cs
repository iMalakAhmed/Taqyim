using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.DTOs;
using Taqyim.Api.Models;
using Taqyim.Api.Models.DTOs;

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

    [HttpGet("businesses")]
    public async Task<ActionResult<IEnumerable<Business>>> SearchBusinesses(
        [FromQuery] string? query,
        [FromQuery] string? category,
        [FromQuery] decimal? latitude,
        [FromQuery] decimal? longitude,
        [FromQuery] double? radiusKm)
    {
        var businesses = _context.Businesses
            .Include(b => b.BusinessLocations)
            .AsQueryable();

        // Apply search query
        if (!string.IsNullOrWhiteSpace(query))
        {
            businesses = businesses.Where(b =>
                b.Name.Contains(query) ||
                b.Description.Contains(query) ||
                b.Category.Contains(query));
        }

        // Filter by category
        if (!string.IsNullOrWhiteSpace(category))
        {
            businesses = businesses.Where(b => b.Category == category);
        }

        // Filter by location if coordinates and radius are provided
        if (latitude.HasValue && longitude.HasValue && radiusKm.HasValue)
        {
            businesses = businesses.Where(b => b.BusinessLocations.Any(loc =>
                CalculateDistance(
                    latitude.Value,
                    longitude.Value,
                    loc.Latitude ?? 0,
                    loc.Longitude ?? 0) <= radiusKm.Value));
        }

        return await businesses.ToListAsync();
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<User>>> SearchUsers(
        [FromQuery] string? query,
        [FromQuery] string? type)
    {
        var users = _context.Users.AsQueryable();

        // Apply search query
        if (!string.IsNullOrWhiteSpace(query))
        {
            users = users.Where(u =>
                u.FirstName.Contains(query) ||
                u.LastName.Contains(query) ||
                u.Email.Contains(query) ||
                u.BusinessName.Contains(query));
        }

        // Filter by user type
        if (!string.IsNullOrWhiteSpace(type))
        {
            users = users.Where(u => u.Type == type);
        }

        return await users.ToListAsync();
    }

    [HttpGet("reviews")]
    public async Task<ActionResult<IEnumerable<Review>>> SearchReviews(
        [FromQuery] string? query,
        [FromQuery] int? minRating,
        [FromQuery] int? maxRating)
    {
        var reviews = _context.Reviews
            .Include(r => r.Business)
            .Include(r => r.Reviewer)
            .AsQueryable();

        // Apply search query
        if (!string.IsNullOrWhiteSpace(query))
        {
            reviews = reviews.Where(r =>
                r.Content.Contains(query) ||
                r.Business.Name.Contains(query));
        }

        // Filter by rating range
        if (minRating.HasValue)
        {
            reviews = reviews.Where(r => r.Rating >= minRating.Value);
        }

        if (maxRating.HasValue)
        {
            reviews = reviews.Where(r => r.Rating <= maxRating.Value);
        }

        return await reviews.ToListAsync();
    }

    private double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
    {
        const double EarthRadiusKm = 6371;

        var dLat = ToRadians((double)(lat2 - lat1));
        var dLon = ToRadians((double)(lon2 - lon1));

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians((double)lat1)) * Math.Cos(ToRadians((double)lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return EarthRadiusKm * c;
    }

    private double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
} 