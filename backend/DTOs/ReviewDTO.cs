using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Taqyim.Api.DTOs;

public class ReviewDTO
{
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public int BusinessId { get; set; }
    public int? ProductId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? SavedAt { get; set; }
    public required UserDTO User { get; set; }
    public required BusinessDTO Business { get; set; }
    public required ProductDTO? Product { get; set; }


    public ICollection<CommentDTO> Comments { get; set; } = new List<CommentDTO>();
    public ICollection<ReactionDTO> Reactions { get; set; } = new List<ReactionDTO>();
    public ICollection<TagDTO> Tags { get; set; } = new List<TagDTO>();
    public ICollection<MediaDTO> Media { get; set; } = new List<MediaDTO>();

}

public class MediaRefDTO
{
    public int MediaId { get; set; }
}


public class CreateReviewDTO
{
    [Required]
    public int BusinessId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    public string Comment { get; set; } = string.Empty;

    public List<string>? Tags { get; set; }
    public int? ProductId { get; set; }

    public List<MediaRefDTO>? Media { get; set; }

}

public class UpdateReviewDTO
{
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    public string Comment { get; set; } = string.Empty;

    public List<string>? Tags { get; set; }

    public ICollection<MediaDTO> Media { get; set; } = new List<MediaDTO>();

}

public class CommentDTO
{
    public int CommentId { get; set; }
    public int CommenterId { get; set; }
    public int ReviewId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public required UserDTO Commenter { get; set; }
    public bool isDeleted { get; set; }    public int? ParentCommentId { get; set; }
    public List<CommentDTO> Replies { get; set; } = new();
    public List<CommentReactionDTO> Reactions { get; set; } = new();
}

public class CreateCommentDTO
{
    public int ReviewId { get; set; }
    public string Content { get; set; } = string.Empty;

    public int? ParentCommentId { get; set; }
}

public class ReactionDTO
{
    public int ReactionId { get; set; }
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public string ReactionType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public required UserDTO User { get; set; }
}

public class CreateReactionDTO
{
    public int ReviewId { get; set; }
    public string ReactionType { get; set; } = string.Empty;
}

public class CommentReactionDTO
{
    public int CommentReactionId { get; set; }
    public int CommentId { get; set; }
    public int UserId { get; set; }
    public string? ReactionType { get; set; }
    public DateTime? CreatedAt { get; set; }

    public required UserDTO User { get; set; }
}

public class CreateCommentReactionDTO
{
    public int CommentId { get; set; }
    public string? ReactionType { get; set; }
}

public class TagDTO
{
    public int TagId { get; set; }
    public string TagType { get; set; } = string.Empty;
    public int ReviewId { get; set; }
} 