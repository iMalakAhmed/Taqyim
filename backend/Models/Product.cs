using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;
public class Product
{
    public int ProductId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsDeleted { get; set; } = false; // Soft delete flag

    // Optional reference to a business
    public int? BusinessId { get; set; }
    public Business? Business { get; set; }

    // Navigation for reviews that include this product
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
