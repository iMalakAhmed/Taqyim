using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Taqyim.Api.Models;

namespace Taqyim.Api.DTOs
{
    public class BusinessCreateDto
    {
        public string Name { get; set; } = null!;
        public ICollection<string>? Category { get; set; }
        public string? Description { get; set; }
    }

    public class BusinessUpdateDto
    {
        public string? Name { get; set; }
        public ICollection<string>? Category { get; set; }
        public string? Description { get; set; }
        public string? Logo { get; set; }
    }

    public class BusinessDTO
    {
        public int BusinessId { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Logo { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public bool IsVerified { get; set; }
        public UserDTO Owner { get; set; } = null!;
        public UserDTO? VerifiedByUser { get; set; }
        public required ICollection<string> Category { get; set; }
        public required ICollection<BusinessLocationDTO> BusinessLocations { get; set; }
        public ICollection<ProductDTO> Products { get; set; } = new List<ProductDTO>();
        public virtual ICollection<ConnectionDTO>? ConnectionFollowers { get; set; } = new List<ConnectionDTO>();
        public virtual ICollection<ConnectionDTO> ConnectionFollowings { get; set; } = new List<ConnectionDTO>();
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }
    }
}