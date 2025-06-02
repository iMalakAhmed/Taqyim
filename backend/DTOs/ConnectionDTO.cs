using System;

namespace Taqyim.Api.DTOs;

public class ConnectionDTO
{
    public int ConnectionId { get; set; }
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }
    public DateTime CreatedAt { get; set; }
    public required UserDTO Follower { get; set; }
    public required UserDTO Following { get; set; }
}

public class CreateConnectionDTO
{
    public int FollowingId { get; set; }
} 