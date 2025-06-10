using Microsoft.AspNetCore.Mvc;
using Taqyim.Api.Services;
using Taqyim.Api.DTOs.Recommendation;
using Taqyim.Api.Data;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationController : ControllerBase
{
    private readonly RecommendationDataService _service;

    public RecommendationController(RecommendationDataService service)
    {
        _service = service;
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
    Directory.CreateDirectory(exportDir); // Ensure folder exists

    var filePath = Path.Combine(exportDir, $"taqyim_user_{userId}.csv");

    await _service.ExportToCsv(rows, filePath);

    return PhysicalFile(filePath, "text/csv", Path.GetFileName(filePath));
}

}
