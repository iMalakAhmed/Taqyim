using System;

namespace Taqyim.Api.DTOs
{
    public class BusinessLocationCreateDto
    {
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Label { get; set; }
    }

    public class BusinessLocationUpdateDto
    {
        public string? Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Label { get; set; }
    }

    public class BusinessLocationDTO
    {
        public int LocationId { get; set; }
        public int BusinessId { get; set; }
        public string Address { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? Label { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
