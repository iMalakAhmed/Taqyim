using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Taqyim.Api.DTOs;

public class ProductCreateDTO
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int BusinessId { get; set; }
    public bool IsDeleted { get; set; } = false;
}
public class ProductUpdateDTO
{
    public string? Name { get; set; }
    public string? Description { get; set; }
}
public class ProductDTO
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsDeleted { get; set; } = false;
    public int BusinessId { get; set; }
}

