using System;
using System.Collections.Generic;

namespace Taqyim.Api.DTOs;
public class FollowRequest
{
    public int FollowingId { get; set; }
    public string FollowerType { get; set; } = "User";
    public string FollowingType { get; set; } = "User";
}
