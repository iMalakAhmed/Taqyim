using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;


public partial class CommentReaction
{
    public int CommentReactionId { get; set; }
    public int CommentId { get; set; }
    public int UserId { get; set; }
    public string? ReactionType { get; set; }
    public DateTime? CreatedAt { get; set; }

    public virtual Comment Comment { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
