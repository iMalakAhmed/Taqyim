using System;
using System.ComponentModel.DataAnnotations;

namespace Taqyim.Api.DTOs;

public class UserDTO
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Type { get; set; } = "User";
    public string? BusinessName { get; set; }
    public string? BusinessCategory { get; set; }
    public string? BusinessDescription { get; set; }
    public string? BusinessAddress { get; set; }
    public decimal? BusinessLatitude { get; set; }
    public decimal? BusinessLongitude { get; set; }
    public bool IsVerified { get; set; }
    public string? ProfilePic { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ReputationPoints { get; set; }
}

public class UpdateUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePic { get; set; }
}