using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Review
{
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public int BusinessId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public virtual Business Business { get; set; } = null!;
    public virtual ICollection<ReviewImage> ReviewImages { get; set; } = new List<ReviewImage>();
    public virtual User User { get; set; } = null!;
}
