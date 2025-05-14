using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class BusinessLocation
{
    public int LocationId { get; set; }
    public int BusinessId { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Label { get; set; }
    public DateTime? CreatedAt { get; set; }
    public Business Business { get; set; } = null!;
}
