using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Business
{
    public int BusinessId { get; set; }
    public int UserId { get; set; }
    public string? Location { get; set; }
    public string Name { get; set; } = null!;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public int? VerifiedByUserId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual ICollection<BusinessLocation> BusinessLocations { get; set; } = new List<BusinessLocation>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual User User { get; set; } = null!;
    public virtual User? VerifiedByUser { get; set; }
}
