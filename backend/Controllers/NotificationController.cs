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
public class NotificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /api/notification
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDTO>>> GetNotifications()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
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
                    FirstName = n.User.FirstName,
                    LastName = n.User.LastName,
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
                    FirstName = n.Sender.FirstName,
                    LastName = n.Sender.LastName,
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
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<NotificationDTO>> CreateNotification(CreateNotificationDTO createNotificationDTO)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
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
                FirstName = createdNotification.Sender.FirstName,
                LastName = createdNotification.Sender.LastName,
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
                FirstName = createdNotification.User.FirstName,
                LastName = createdNotification.User.LastName,
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
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId);

        if (notification == null)
            return NotFound();

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: /api/notification
    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> DeleteAllNotifications()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        _context.Notifications.RemoveRange(notifications);
        await _context.SaveChangesAsync();

        return NoContent();
    }
} 