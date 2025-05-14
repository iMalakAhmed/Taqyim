using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Comment
{
    public int CommentId { get; set; }
    public int CommenterId { get; set; }
    public int ReviewId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public User Commenter { get; set; } = null!;
    public Review Review { get; set; } = null!;
}
