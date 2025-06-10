using System;

namespace Taqyim.Api.DTOs;

public class NotificationDTO
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public int? SenderId { get; set; }
    public DateTime Timestamp { get; set; }
    public bool IsRead { get; set; }
    public UserDTO? Sender { get; set; }
    public required UserDTO User { get; set; }
}

public class CreateNotificationDTO
{
    public int UserId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public int? SenderId { get; set; }
} 