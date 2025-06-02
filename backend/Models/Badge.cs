using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Badge
{
    public int BadgeId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
