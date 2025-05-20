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
    public List<BusinessLocation> BusinessLocations { get; set; } = new List<BusinessLocation>();
    public List<Review> Reviews { get; set; } = new List<Review>();
    public User User { get; set; } = null!;
    public User? VerifiedByUser { get; set; }
    public bool IsDeleted { get; set; } = false;
    public string? Logo { get; set; }
}
