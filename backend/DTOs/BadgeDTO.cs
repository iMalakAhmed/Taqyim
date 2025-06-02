using System;
using System.Collections.Generic;

namespace Taqyim.Api.DTOs;

public class BadgeDTO
{
    public int BadgeId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Icon { get; set; }
    public int PointsRequired { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<UserDTO>? Users { get; set; }
    public ICollection<UserBadgeDTO>? UserBadges { get; set; }
}

public class CreateBadgeDTO
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}

public class UpdateBadgeDTO
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
} 