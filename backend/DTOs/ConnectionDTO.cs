using System;

namespace Taqyim.Api.DTOs;

public class ConnectionDTO
{
    public int ConnectionId { get; set; }
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserDTO Follower { get; set; } = null!;
    public UserDTO Following { get; set; } = null!;
}

public class CreateConnectionDTO
{
    public int FollowingId { get; set; }
} 