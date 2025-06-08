using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.DTOs;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public MediaController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MediaDTO>>> GetMedia([FromQuery] int? userId)
    {
        var query = _context.Media
            .Include(m => m.User)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(m => m.UserId == userId);
        }

        var media = await query
            .Select(m => new MediaDTO
            {
                MediaId = m.MediaId,
                UserId = m.UserId,
                FileName = m.FileName,
                FilePath = m.FilePath,
                FileType = m.FileType,
                FileSize = m.FileSize,
                UploadedAt = m.UploadedAt,
                User = new UserDTO
                {
                    UserId = m.User.UserId,
                    Email = m.User.Email,
                    UserName = m.User.UserName,
                    Type = m.User.Type,
                    IsVerified = m.User.IsVerified,
                    ProfilePic = m.User.ProfilePic,
                    Bio = m.User.Bio,
                    CreatedAt = m.User.CreatedAt,
                    ReputationPoints = m.User.ReputationPoints
                }
            })
            .ToListAsync();

        return Ok(media);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MediaDTO>> GetMedia(int id)
    {
        var media = await _context.Media
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.MediaId == id);

        if (media == null)
        {
            return NotFound();
        }

        var mediaDto = new MediaDTO
        {
            MediaId = media.MediaId,
            UserId = media.UserId,
            FileName = media.FileName,
            FilePath = media.FilePath,
            FileType = media.FileType,
            FileSize = media.FileSize,
            UploadedAt = media.UploadedAt,
            User = new UserDTO
            {
                UserId = media.User.UserId,
                Email = media.User.Email,
                UserName = media.User.UserName,
                Type = media.User.Type,
                IsVerified = media.User.IsVerified,
                ProfilePic = media.User.ProfilePic,
                Bio = media.User.Bio,
                CreatedAt = media.User.CreatedAt,
                ReputationPoints = media.User.ReputationPoints
            }
        };

        return Ok(mediaDto);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<MediaDTO>> UploadMedia([FromForm] CreateMediaDTO createMediaDto)
    {
        var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
        if (userId == 0)
        {
            return Unauthorized();
        }

        var file = createMediaDto.File;
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Create uploads directory if it doesn't exist
        var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsDir))
        {
            Directory.CreateDirectory(uploadsDir);
        }

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsDir, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var media = new Media
        {
            User = await _context.Users.FindAsync(userId),
            FileName = fileName,
            FileType = file.ContentType,
            FileSize = file.Length,
            FilePath = $"/uploads/{fileName}",
            UploadedAt = DateTime.UtcNow
        };

        _context.Media.Add(media);
        await _context.SaveChangesAsync();

        var mediaDto = new MediaDTO
        {
            MediaId = media.MediaId,
            UserId = media.UserId,
            FileName = media.FileName,
            FilePath = media.FilePath,
            FileType = media.FileType,
            FileSize = media.FileSize,
            UploadedAt = media.UploadedAt,
            User = new UserDTO
            {
                UserId = userId,
                Email = User.FindFirst("Email")?.Value ?? string.Empty,
                UserName = User.FindFirst("UserName")?.Value ?? string.Empty,
                Type = User.FindFirst("Type")?.Value ?? string.Empty,
                IsVerified = bool.TryParse(User.FindFirst("IsVerified")?.Value, out var isVerified) && isVerified,
                ProfilePic = User.FindFirst("ProfilePic")?.Value ?? string.Empty,
                Bio = User.FindFirst("Bio")?.Value ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                ReputationPoints = 0 // Assuming default value
            }
        };

        return CreatedAtAction(nameof(GetMedia), new { id = media.MediaId }, mediaDto);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedia(int id)
    {
        var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
        if (userId == 0)
        {
            return Unauthorized();
        }

        var media = await _context.Media.FindAsync(id);
        if (media == null)
        {
            return NotFound();
        }

        if (media.UserId != userId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        // Delete file from disk
        var filePath = Path.Combine(_environment.WebRootPath, media.FilePath.TrimStart('/'));
        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        _context.Media.Remove(media);
        await _context.SaveChangesAsync();

        return NoContent();
    }
} 