using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Connection
{
    public int ConnectionId { get; set; }
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public User Follower { get; set; } = null!;
    public User Following { get; set; } = null!;
}
