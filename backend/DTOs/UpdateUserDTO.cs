using System.ComponentModel.DataAnnotations;

namespace Taqyim.Api.DTOs;

public class UpdateUserDTO
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public string? Bio { get; set; }

    public string? ProfilePic { get; set; }
} 