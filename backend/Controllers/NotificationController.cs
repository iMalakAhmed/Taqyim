using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.DTOs;
using Microsoft.AspNetCore.Http;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    // Common notification types
    public static class NotificationTypes
    {
        public const string NewMessage = "NEW_MESSAGE";
        public const string NewFollower = "NEW_FOLLOWER";
        public const string NewReview = "NEW_REVIEW";
        public const string ReviewLiked = "REVIEW_LIKED";
        public const string ReviewCommented = "REVIEW_COMMENTED";
        public const string BadgeEarned = "BADGE_EARNED";
        public const string SystemNotification = "SYSTEM_NOTIFICATION";
    }

    public NotificationController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    // GET: /api/notification
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDTO>>> GetNotifications()
    {
        var userId = int.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.Timestamp)
            .Select(n => new NotificationDTO
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                NotificationType = n.NotificationType ?? string.Empty,
                SenderId = n.SenderId,
                Timestamp = n.Timestamp ?? DateTime.UtcNow,
                User = new UserDTO
                {
                    UserId = n.User.UserId,
                    Email = n.User.Email,
                    UserName = n.User.UserName,
                    Type = n.User.Type,
                    IsVerified = n.User.IsVerified,
                    ProfilePic = n.User.ProfilePic,
                    Bio = n.User.Bio,
                    CreatedAt = n.User.CreatedAt,
                    ReputationPoints = n.User.ReputationPoints
                },
                Sender = n.Sender != null ? new UserDTO
                {
                    UserId = n.Sender.UserId,
                    Email = n.Sender.Email,
                    UserName = n.Sender.UserName,
                    Type = n.Sender.Type,
                    IsVerified = n.Sender.IsVerified,
                    ProfilePic = n.Sender.ProfilePic,
                    Bio = n.Sender.Bio,
                    CreatedAt = n.Sender.CreatedAt,
                    ReputationPoints = n.Sender.ReputationPoints
                } : null
            })
            .ToListAsync();

        return notifications;
    }

    // POST: /api/notification
    [HttpPost]
    public async Task<ActionResult<NotificationDTO>> CreateNotification(CreateNotificationDTO createNotificationDTO)
    {
        var userId = int.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("User not authenticated"));
        var user = await _context.Users.FindAsync(createNotificationDTO.UserId);

        if (user == null)
            return NotFound("User not found");

        var notification = new Notification
        {
            UserId = createNotificationDTO.UserId,
            NotificationType = createNotificationDTO.NotificationType,
            SenderId = createNotificationDTO.SenderId,
            Timestamp = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var createdNotification = await _context.Notifications
            .Include(n => n.Sender)
            .Include(n => n.User)
            .FirstOrDefaultAsync(n => n.NotificationId == notification.NotificationId);

        return new NotificationDTO
        {
            NotificationId = createdNotification!.NotificationId,
            UserId = createdNotification.UserId,
            NotificationType = createdNotification.NotificationType ?? string.Empty,
            SenderId = createdNotification.SenderId,
            Timestamp = createdNotification.Timestamp ?? DateTime.UtcNow,
            Sender = createdNotification.Sender != null ? new UserDTO
            {
                UserId = createdNotification.Sender.UserId,
                Email = createdNotification.Sender.Email,
                UserName = createdNotification.Sender.UserName,
                Type = createdNotification.Sender.Type,
                IsVerified = createdNotification.Sender.IsVerified,
                ProfilePic = createdNotification.Sender.ProfilePic,
                Bio = createdNotification.Sender.Bio,
                CreatedAt = createdNotification.Sender.CreatedAt,
                ReputationPoints = createdNotification.Sender.ReputationPoints
            } : null,
            User = new UserDTO
            {
                UserId = createdNotification.User.UserId,
                Email = createdNotification.User.Email,
                UserName = createdNotification.User.UserName,
                Type = createdNotification.User.Type,
                IsVerified = createdNotification.User.IsVerified,
                ProfilePic = createdNotification.User.ProfilePic,
                Bio = createdNotification.User.Bio,
                CreatedAt = createdNotification.User.CreatedAt,
                ReputationPoints = createdNotification.User.ReputationPoints
            }
        };
    }

    // DELETE: /api/notification/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var userId = int.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("User not authenticated"));
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId);

        if (notification == null)
            return NotFound();

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: /api/notification
    [HttpDelete]
    public async Task<IActionResult> DeleteAllNotifications()
    {
        var userId = int.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("User not authenticated"));
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        _context.Notifications.RemoveRange(notifications);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: /api/notification/unread/count
    [HttpGet("unread/count")]
    public async Task<ActionResult<int>> GetUnreadNotificationsCount()
    {
        var userId = int.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("User not authenticated"));
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    // PUT: /api/notification/{id}/read
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkNotificationAsRead(int id)
    {
        var userId = int.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("User not authenticated"));
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId);

        if (notification == null)
            return NotFound();

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: /api/notification/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllNotificationsAsRead()
    {
        var userId = int.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("User not authenticated"));
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET: /api/notification/unread
    [HttpGet("unread")]
    public async Task<ActionResult<IEnumerable<NotificationDTO>>> GetUnreadNotifications()
    {
        var userId = int.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("User not authenticated"));
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.Timestamp)
            .Select(n => new NotificationDTO
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                NotificationType = n.NotificationType ?? string.Empty,
                SenderId = n.SenderId,
                Timestamp = n.Timestamp ?? DateTime.UtcNow,
                IsRead = n.IsRead,
                User = new UserDTO
                {
                    UserId = n.User.UserId,
                    Email = n.User.Email,
                    UserName = n.User.UserName,
                    Type = n.User.Type,
                    IsVerified = n.User.IsVerified,
                    ProfilePic = n.User.ProfilePic,
                    Bio = n.User.Bio,
                    CreatedAt = n.User.CreatedAt,
                    ReputationPoints = n.User.ReputationPoints
                },
                Sender = n.Sender != null ? new UserDTO
                {
                    UserId = n.Sender.UserId,
                    Email = n.Sender.Email,
                    UserName = n.Sender.UserName,
                    Type = n.Sender.Type,
                    IsVerified = n.Sender.IsVerified,
                    ProfilePic = n.Sender.ProfilePic,
                    Bio = n.Sender.Bio,
                    CreatedAt = n.Sender.CreatedAt,
                    ReputationPoints = n.Sender.ReputationPoints
                } : null
            })
            .ToListAsync();

        return notifications;
    }
} 