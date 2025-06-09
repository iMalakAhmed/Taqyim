using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Taqyim.Api.Models;

public class Connection
{

    public int ConnectionId { get; set; }


    public int? FollowerId { get; set; }


    public int? FollowingId { get; set; }

    public User? Follower { get; set; }

    public User? Following { get; set; }


    public DateTime CreatedAt { get; set; }

    public string FollowerType { get; set; } = "User";     // "User" or "Business"
    public string FollowingType { get; set; } = "User";    // "User" or "Business"


    public int? BusinessFollowingId { get; set; }
    public Business? BusinessFollowing { get; set; } = null!;

    public int? BusinessFollowerId { get; set; }
    public Business? BusinessFollower { get; set; } = null!;

}
