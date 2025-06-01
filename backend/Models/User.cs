using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Taqyim.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string PasswordHash { get; set; } = null!;

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Type { get; set; } = "User";
    public string? BusinessName { get; set; }
    public string? BusinessCategory { get; set; }
    public string? BusinessDescription { get; set; }
    public string? BusinessAddress { get; set; }
    public decimal? BusinessLatitude { get; set; }
    public decimal? BusinessLongitude { get; set; }
    public bool IsVerified { get; set; }
    public int? VerifiedByUserId { get; set; }
    public string? ProfilePic { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int ReputationPoints { get; set; }
    public virtual User? VerifiedByUser { get; set; }
    public virtual ICollection<User> VerifiedBusinesses { get; set; } = new List<User>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Connection> ConnectionFollowers { get; set; } = new List<Connection>();
    public virtual ICollection<Connection> ConnectionFollowings { get; set; } = new List<Connection>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    public virtual ICollection<Notification> NotificationSenders { get; set; } = new List<Notification>();
    public virtual ICollection<Notification> NotificationUsers { get; set; } = new List<Notification>();
    public virtual ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
}
