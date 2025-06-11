using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Net.Http.Json;
using Taqyim.Api.Data;
using Taqyim.Api.DTOs.Recommendation;
using Taqyim.Api.Models;
using Taqyim.Api.Services;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationController : ControllerBase
{
    private readonly RecommendationDataService _service;
    private readonly ApplicationDbContext _context;
    private readonly HttpClient _httpClient;

    public RecommendationController(RecommendationDataService service, ApplicationDbContext context)
    {
        _service = service;
        _context = context;
        _httpClient = new HttpClient();
    }

    public class RecommendationResult
    {
        public int UserId { get; set; }
        public List<RecommendationItem> Recommendations { get; set; } = new();
    }

    public class RecommendationItem
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
    }


    [HttpGet("dataset/{userId}")]
    public async Task<ActionResult<List<RecommendationRowDTO>>> GenerateDataset(int userId)
    {
        var rows = await _service.GenerateAllUserData(userId);
        return Ok(rows.Select(r => new RecommendationRowDTO
        {
            UserId = r.UserId,
            ItemId = r.ItemId,
            ItemType = r.ItemType,
            Score = r.Score
        }).ToList());
    }

    [HttpGet("export/{userId}")]
    public async Task<IActionResult> ExportDataset(int userId)
    {
        var rows = await _service.GenerateAllUserData(userId);
        var exportDir = Path.Combine(Directory.GetCurrentDirectory(), "Data", "exports");
        Directory.CreateDirectory(exportDir);

        var filePath = Path.Combine(exportDir, $"taqyim_user_{userId}.csv");
        await _service.ExportToCsv(rows, filePath);

        return PhysicalFile(filePath, "text/csv", Path.GetFileName(filePath));
    }

    [HttpGet("export-all")]
    public async Task<IActionResult> ExportAllUsersDataset()
    {
        var allRows = new List<RecommendationRow>();
        var userIds = await _context.Users.Select(u => u.UserId).ToListAsync();

        foreach (var userId in userIds)
        {
            var rows = await _service.GenerateAllUserData(userId);
            allRows.AddRange(rows);
        }

        var exportDir = Path.Combine(Directory.GetCurrentDirectory(), "Data", "exports");
        Directory.CreateDirectory(exportDir);
        var filePath = Path.Combine(exportDir, "taqyim_all_users.csv");

        await _service.ExportToCsv(allRows, filePath);
        return PhysicalFile(filePath, "text/csv", Path.GetFileName(filePath));
    }

    [HttpGet("businesses/{userId}")]
    public async Task<IActionResult> RecommendBusinesses(int userId)
    {
        try
        {
            var result = await _httpClient.GetFromJsonAsync<RecommendationResult>(
                $"http://localhost:8000/recommend/{userId}");

            if (result == null || result.Recommendations == null || !result.Recommendations.Any())
                return NotFound("No recommendations found");

            // Filter for only business-type items
            var businessIds = result.Recommendations
                .Where(r => r.Type == "Business")
                .Select(r => r.Id)
                .ToList();

            if (!businessIds.Any())
                return NotFound("No business recommendations found");

            var businesses = await _context.Businesses
                .Where(b => businessIds.Contains(b.BusinessId))
                .ToListAsync();

            return Ok(businesses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Recommendation API failed: {ex.Message}");
        }
    }
    
        [HttpGet("users/{userId}")]
    public async Task<IActionResult> RecommendUsers(int userId)
    {
        try
        {
            var result = await _httpClient.GetFromJsonAsync<RecommendationResult>(
                $"http://localhost:8000/recommend/{userId}");

            if (result == null || result.Recommendations == null || !result.Recommendations.Any())
                return NotFound("No recommendations found");

            var userIds = result.Recommendations
                .Where(r => r.Type == "User")
                .Select(r => r.Id)
                .ToList();

            if (!userIds.Any())
                return NotFound("No user recommendations found");

            var users = await _context.Users
                .Where(u => userIds.Contains(u.UserId))
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Recommendation API failed: {ex.Message}");
        }
    }

    [HttpGet("reviews/{userId}")]
    public async Task<IActionResult> RecommendReviews(int userId)
    {
        try
        {
            var result = await _httpClient.GetFromJsonAsync<RecommendationResult>(
                $"http://localhost:8000/recommend/{userId}");

            if (result == null || result.Recommendations == null || !result.Recommendations.Any())
                return NotFound("No recommendations found");

            var reviewIds = result.Recommendations
                .Where(r => r.Type == "Review")
                .Select(r => r.Id)
                .ToList();

            if (!reviewIds.Any())
                return NotFound("No review recommendations found");

            var reviews = await _context.Reviews
                .Where(r => reviewIds.Contains(r.ReviewId))
                .ToListAsync();

            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Recommendation API failed: {ex.Message}");
        }
    }

}
