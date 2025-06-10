using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Taqyim.Api.Models;

public class User
{
    [Key]
    public int UserId { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string PasswordHash { get; set; } = null!;
    public string UserName { get; set; } = string.Empty;
    public string? Type { get; set; } = "User";
    public string? phoneNumber { get; set; }
    public bool IsVerified { get; set; }= false;
    public int? VerifiedByUserId { get; set; }
    public string? ProfilePic { get; set; }
    public string? Bio { get; set; } = string.Empty;
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
    public virtual ICollection<Business> BusinessUsers { get; set; } = new List<Business>();
    public virtual ICollection<Business> BusinessVerifiedByUsers { get; set; } = new List<Business>();
    public virtual ICollection<Business> UsersBusinesses { get; set; } = new List<Business>();
    public virtual ICollection<Connection> Connections { get; set; } = new List<Connection>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<Media> Media { get; set; } = new List<Media>();
    //public virtual ICollection<SavedReview> SavedReviews { get; set; } = new List<SavedReview>();
}
