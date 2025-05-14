using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class UserBadge
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BadgeId { get; set; }
    public DateTime? AwardedAt { get; set; }
    public Badge Badge { get; set; } = null!;
    public User User { get; set; } = null!;
}
