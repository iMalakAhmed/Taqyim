using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Reaction
{
    public int ReactionId { get; set; }
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public string? ReactionType { get; set; }
    public DateTime? CreatedAt { get; set; }
    public Review Review { get; set; } = null!;
    public User User { get; set; } = null!;
}
