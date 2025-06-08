using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Taqyim.Api.Models;

public partial class Comment
{
    public int CommentId { get; set; }
    public int CommenterId { get; set; }
    public int ReviewId { get; set; }
    public string Content { get; set; } = null!;
    public bool IsDeleted { get; set; } = false;
    public DateTime? CreatedAt { get; set; }

    public int? ParentCommentId { get; set; } 

    public User Commenter { get; set; } = null!;
    public Review Review { get; set; } = null!;

    [ForeignKey("ParentCommentId")]
    public virtual Comment? ParentComment { get; set; }

    public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();
    public virtual ICollection<CommentReaction> Reactions { get; set; } = new List<CommentReaction>();
}
