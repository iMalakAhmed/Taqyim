using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TestController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("db-connection")]
    public async Task<IActionResult> TestDbConnection()
    {
        try
        {
            // Try to execute a simple query
            var canConnect = await _context.Database.CanConnectAsync();
            
            if (canConnect)
            {
                return Ok(new { 
                    status = "success", 
                    message = "Database connection successful",
                    connectionString = _context.Database.GetConnectionString()
                });
            }
            else
            {
                return BadRequest(new { 
                    status = "error", 
                    message = "Could not connect to the database" 
                });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                status = "error", 
                message = "Database connection failed", 
                error = ex.Message 
            });
        }
    }
} 