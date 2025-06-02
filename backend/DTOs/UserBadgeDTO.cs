using System;

namespace Taqyim.Api.DTOs;

public class UserBadgeDTO
{
    public int UserBadgeId { get; set; }
    public int UserId { get; set; }
    public int BadgeId { get; set; }
    public DateTime AwardedAt { get; set; }
    public BadgeDTO Badge { get; set; } = null!;
}

public class AwardBadgeDTO
{
    public int UserId { get; set; }
    public int BadgeId { get; set; }
} 