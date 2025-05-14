using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Notification
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string? NotificationType { get; set; }
    public int? SenderId { get; set; }
    public DateTime? Timestamp { get; set; }
    public User? Sender { get; set; }
    public User User { get; set; } = null!;
}
