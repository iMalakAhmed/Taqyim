using System;

namespace Taqyim.Api.DTOs;

public class BadgeDTO
{
    public int BadgeId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
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