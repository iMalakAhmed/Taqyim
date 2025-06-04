using System;

namespace Taqyim.Api.DTOs;

public class ReviewImageDTO
{
    public int ReviewImageId { get; set; }
    public int ReviewId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Order { get; set; }
} 