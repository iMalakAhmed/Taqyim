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
    public string? ProfilePic { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int ReputationPoints { get; set; }

    public List<Business> BusinessUsers { get; set; } = new List<Business>();
    public List<Business> BusinessVerifiedByUsers { get; set; } = new List<Business>();
    public List<Comment> Comments { get; set; } = new List<Comment>();
    public List<Connection> ConnectionFollowers { get; set; } = new List<Connection>();
    public List<Connection> ConnectionFollowings { get; set; } = new List<Connection>();
    public List<Message> Messages { get; set; } = new List<Message>();
    public List<Notification> NotificationSenders { get; set; } = new List<Notification>();
    public List<Notification> NotificationUsers { get; set; } = new List<Notification>();
    public List<Reaction> Reactions { get; set; } = new List<Reaction>();
    public List<Review> Reviews { get; set; } = new List<Review>();
    public List<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
    public List<Conversation> Conversations { get; set; } = new List<Conversation>();
}
