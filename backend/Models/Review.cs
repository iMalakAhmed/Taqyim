using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Review
{
    public int ReviewId { get; set; }
    public int ReviewerId { get; set; }
    public int BusinessId { get; set; }
    public string Type { get; set; } = null!;
    public string? Content { get; set; }
    public string? Media { get; set; }
    public int Rating { get; set; }
    public DateTime? CreatedAt { get; set; }
    public Business Business { get; set; } = null!;
    public List<Comment> Comments { get; set; } = new List<Comment>();
    public List<Reaction> Reactions { get; set; } = new List<Reaction>();
    public User Reviewer { get; set; } = null!;
    public List<Tag> Tags { get; set; } = new List<Tag>();
}
