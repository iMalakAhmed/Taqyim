using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Taqyim.Api.Models;

public partial class Review
{
    [Key]
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public int BusinessId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    [ForeignKey("BusinessId")]
    public virtual Business Business { get; set; } = null!;
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public virtual ICollection<SavedReview> SavedByUsers { get; set; } = new List<SavedReview>();
    public virtual ICollection<Media> Media { get; set; } = new List<Media>();
    public int? ProductId { get; set; }
    public Product? Product { get; set; }
}
