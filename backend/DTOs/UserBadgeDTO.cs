using System;

namespace Taqyim.Api.DTOs;

public class UserBadgeDTO
{
    public int UserBadgeId { get; set; }
    public int UserId { get; set; }
    public int BadgeId { get; set; }
    public DateTime AwardedAt { get; set; }
    public required BadgeDTO Badge { get; set; }
    public required UserDTO User { get; set; }
}

public class AwardBadgeDTO
{
    public int UserId { get; set; }
    public int BadgeId { get; set; }
} 