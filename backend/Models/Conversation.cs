using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Conversation
{
    public int ConversationId { get; set; }
    // The following properties are commented out because EF Core cannot automatically map them.
    // If you need these relationships, configure them explicitly in OnModelCreating.
    // public int User1Id { get; set; }
    // public int User2Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public string? Name { get; set; }
    public bool IsGroup { get; set; }
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    // public virtual User User1 { get; set; } = null!;
    // public virtual User User2 { get; set; } = null!;
}
