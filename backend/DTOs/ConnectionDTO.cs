using System;

namespace Taqyim.Api.DTOs;

public class ConnectionDTO
{
    public int ConnectionId { get; set; }
    public int UserId { get; set; }
    public int ConnectedUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public required UserDTO User { get; set; }
    public required UserDTO ConnectedUser { get; set; }
}

public class CreateConnectionDTO
{
    public int FollowingId { get; set; }
} 