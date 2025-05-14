using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Tag
{
    public int TagId { get; set; }
    public string TagType { get; set; } = null!;
    public int ReviewId { get; set; }
    public Review Review { get; set; } = null!;
}
