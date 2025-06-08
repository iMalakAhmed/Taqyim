using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;


public partial class Business
{
    public int BusinessId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public int? VerifiedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public string? Logo { get; set; }
    public int? UserId { get; set; }
    public ICollection<string>? Category { get; set; }= new List<string>();
    public virtual ICollection<BusinessLocation> BusinessLocations { get; set; } = new List<BusinessLocation>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual User Owner { get; set; } = null!;
    public virtual User? VerifiedByUser { get; set; } = null!;
    public virtual ICollection<Product>? Products { get; set; } = new List<Product>();
}

