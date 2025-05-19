namespace Taqyim.Api.DTOs
{
    public class BusinessCreateDto
    {
        public string Name { get; set; } = null!;
        public string? Location { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
    }

    public class BusinessUpdateDto
    {
        public string? Name { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
    }
}