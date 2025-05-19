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
}
