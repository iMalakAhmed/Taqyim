using System;

namespace Taqyim.Api.DTOs;

public class UserDTO
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
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