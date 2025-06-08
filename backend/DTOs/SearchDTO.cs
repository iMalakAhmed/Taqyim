using System;
using Taqyim.Api.Models;

namespace Taqyim.Api.DTOs;

public class SearchBusinessDTO
{
    public int BusinessId { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string Description { get; set; }
    public double? Rating { get; set; }
    public double? PriceRange { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ReviewCount { get; set; }
    public required ICollection<BusinessLocationDTO> BusinessLocations { get; set; } 

}

public class SearchUserDTO
{
    public int UserId { get; set; }
    public required string UserName { get; set; }
    public required string Email { get; set; }
    public required string Type { get; set; }
    public string? ProfilePic { get; set; }
}

public class SearchReviewDTO
{
    public int ReviewId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public int BusinessId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string? UserProfilePic { get; set; }
    public int CommentsCount { get; set; }
    public int ReactionsCount { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class SearchResultDTO
{
    public required ICollection<BusinessDTO> Businesses { get; set; }
    public required ICollection<UserDTO> Users { get; set; }
} 