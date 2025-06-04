using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Taqyim.Api.DTOs
{
    public class BusinessCreateDto
    {
        public string Name { get; set; } = null!;
        public string? Location { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? Logo { get; set; }
    }

    public class BusinessUpdateDto
    {
        public string? Name { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? Logo { get; set; }
    }

    public class BusinessDTO
    {
        public int BusinessId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public string? Location { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsVerified { get; set; }
        public int? VerifiedByUserId { get; set; }
        public UserDTO User { get; set; } = null!;
        public UserDTO? VerifiedByUser { get; set; }
        public required ICollection<BusinessLocationDTO> BusinessLocations { get; set; }
    }
}