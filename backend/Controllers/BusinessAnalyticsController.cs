using Microsoft.AspNetCore.Mvc;
using Taqyim.Api.Services;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/business/{businessId}/analytics")]
public class BusinessAnalyticsController : ControllerBase
{
    private readonly AnalyticsService _analyticsService;

    public BusinessAnalyticsController(AnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAnalytics(int businessId)
    {
        var result = await _analyticsService.GetAnalyticsAsync(businessId);
        if (result == null)
            return NotFound();

        return Ok(result);
    }
}
