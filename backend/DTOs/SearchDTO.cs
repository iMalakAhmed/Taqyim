using System;
using Taqyim.Api.Models;

namespace Taqyim.Api.DTOs;

public class SearchBusinessDTO
{
    public int BusinessId { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string Description { get; set; }
    public required string Location { get; set; }
    public double? Rating { get; set; }
    public double? PriceRange { get; set; }
    public DateTime CreatedAt { get; set; }
    // Temporarily commented out review-related properties
    //public double Rating { get; set; }
    //public int ReviewCount { get; set; }
}

public class SearchUserDTO
{
    public int UserId { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string Type { get; set; }
    public string? ProfilePic { get; set; }
}

// Temporarily commented out review-related DTO
/*
public class SearchReviewDTO
{
    public int ReviewId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}
*/

public class SearchResultDTO
{
    public required ICollection<BusinessDTO> Businesses { get; set; }
    public required ICollection<UserDTO> Users { get; set; }
} 