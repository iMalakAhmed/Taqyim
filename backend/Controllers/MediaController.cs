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

    // GET: api/media
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MediaDTO>>> GetAllMedia([FromQuery] int? reviewId)
    {
        var query = _context.Media
            .Include(m => m.User)
            .AsQueryable();

        if (reviewId.HasValue)
        {
            query = query.Where(m => m.ReviewId == reviewId.Value);
        }

        var mediaList = await query
            .Select(m => new MediaDTO
            {
                MediaId = m.MediaId,
                UserId = m.UserId,
                ReviewId = m.ReviewId,
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

        return Ok(mediaList);
    }

    // GET: api/media/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<MediaDTO>> GetMedia(int id)
    {
        var media = await _context.Media
            .Include(m => m.User)
            .Where(m => m.MediaId == id)
            .Select(m => new MediaDTO
            {
                MediaId = m.MediaId,
                UserId = m.UserId,
                ReviewId = m.ReviewId,
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
            .FirstOrDefaultAsync();

        if (media == null)
            return NotFound();

        return Ok(media);
    }

    // POST: api/media
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<MediaDTO>> CreateMedia([FromForm] CreateMediaDTO createMediaDto)
    {
        if (createMediaDto.File == null || createMediaDto.File.Length == 0)
            return BadRequest("No file uploaded.");

        // Extract UserId from JWT claims
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();

        if (!int.TryParse(userIdClaim.Value, out int userId))
            return Unauthorized();

        // Validate review exists if reviewId is provided
        if (createMediaDto.ReviewId.HasValue)
        {
            var reviewExists = await _context.Reviews.AnyAsync(r => r.ReviewId == createMediaDto.ReviewId.Value);
            if (!reviewExists)
                return BadRequest("Specified review does not exist");
        }

        // Prepare uploads folder
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        // Save file with unique filename
        var uniqueFileName = Guid.NewGuid() + Path.GetExtension(createMediaDto.File.FileName);
        var fullFilePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(fullFilePath, FileMode.Create))
        {
            await createMediaDto.File.CopyToAsync(stream);
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var media = new Media
        {
            UserId = userId,
            User = user,
            ReviewId = createMediaDto.ReviewId,
            FileName = createMediaDto.File.FileName,
            FilePath = "/uploads/" + uniqueFileName, 
            FileType = createMediaDto.File.ContentType,
            FileSize = createMediaDto.File.Length,
            UploadedAt = DateTime.UtcNow
        };

        _context.Media.Add(media);
        await _context.SaveChangesAsync();

        var mediaDto = new MediaDTO
        {
            MediaId = media.MediaId,
            UserId = media.UserId,
            ReviewId = media.ReviewId,
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

        return CreatedAtAction(nameof(GetMedia), new { id = media.MediaId }, mediaDto);
    }

    // DELETE: api/media/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteMedia(int id)
    {
        var media = await _context.Media.FindAsync(id);
        if (media == null)
            return NotFound();

        // Verify ownership before deletion
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId) || media.UserId != userId)
            return Forbid();

        var fullPath = Path.Combine(_environment.WebRootPath, media.FilePath.TrimStart('/'));
        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);

        _context.Media.Remove(media);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}