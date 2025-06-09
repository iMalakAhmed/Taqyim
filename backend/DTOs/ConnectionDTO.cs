using System;

namespace Taqyim.Api.DTOs;

public class ConnectionDTO
{
    public int ConnectionId { get; set; }
    public int UserId { get; set; }
    public int ConnectedUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserDTO? User { get; set; }
    public UserDTO? ConnectedUser { get; set; }
    public BusinessDTO? connectedBusiness { get; set; } = null!;
    public BusinessDTO? UserBusiness { get; set; } = null!;
    public string FollowerType { get; set; } = "User";     // "User" or "Business"
    public string FollowingType { get; set; } = "User";    // "User" or "Business"
    public int? BusinessFollowingId { get; set; }
    public int? BusinessFollowerId { get; set; }
}

public class CreateConnectionDTO
{
    public int FollowingId { get; set; }
} 