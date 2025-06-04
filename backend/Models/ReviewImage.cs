using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Taqyim.Api.Models;

public class ReviewImage
{
    [Key]
    public int ReviewImageId { get; set; }

    [Required]
    public int ReviewId { get; set; }

    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    public string? Caption { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int Order { get; set; }

    [ForeignKey("ReviewId")]
    public Review? Review { get; set; }
} 