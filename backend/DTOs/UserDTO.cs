using System;
using System.ComponentModel.DataAnnotations;
using Taqyim.Api.Models; 

namespace Taqyim.Api.DTOs;


public class UserDTO
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Type { get; set; } = "User";
    public bool IsVerified { get; set; }
    public string? ProfilePic { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ReputationPoints { get; set; }

    public ICollection<Business> UsersBusinesses { get; set; } = new List<Business>();
}

public class UpdateUserDto
{
    public string? UserName { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePic { get; set; }
}