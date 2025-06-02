using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Taqyim.Api.Models;

public class Connection
{
    [Key]
    public int ConnectionId { get; set; }

    [Required]
    public int FollowerId { get; set; }

    [Required]
    public int FollowingId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("FollowerId")]
    public User? Follower { get; set; }

    [ForeignKey("FollowingId")]
    public User? Following { get; set; }
}
