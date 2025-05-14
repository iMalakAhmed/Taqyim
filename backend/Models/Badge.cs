using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Badge
{
    public int BadgeId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Img { get; set; }
    public virtual List<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
