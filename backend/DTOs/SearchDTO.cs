using System;

namespace Taqyim.Api.DTOs;

public class SearchBusinessDTO
{
    public string? Query { get; set; }
    public string? Category { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? Radius { get; set; } // in kilometers
}

public class SearchUserDTO
{
    public string? Query { get; set; }
    public string? UserType { get; set; }
}

public class SearchReviewDTO
{
    public string? Query { get; set; }
    public int? MinRating { get; set; }
    public int? MaxRating { get; set; }
} 