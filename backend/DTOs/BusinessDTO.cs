using System;
using System.Collections.Generic;

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
        public int? VerifiedByUserId { get; set; }
        public required string Location { get; set; }
        public required string Name { get; set; }
        public required string Category { get; set; }
        public required string Description { get; set; }
        public double? Rating { get; set; }
        public double? PriceRange { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public required UserDTO User { get; set; }
        public UserDTO? VerifiedByUser { get; set; }
        public required ICollection<BusinessLocationDTO> BusinessLocations { get; set; }
    }
}