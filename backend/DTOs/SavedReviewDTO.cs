using System.ComponentModel.DataAnnotations;

namespace Taqyim.Api.DTOs
{
    public class SavedReviewDTO
    {
        public int SavedReviewId { get; set; }
        public int UserId { get; set; }
        public int ReviewId { get; set; }
        public DateTime SavedAt { get; set; }
        public UserDTO User { get; set; } = null!;
        public ReviewDTO Review { get; set; } = null!;
    }

    public class CreateSavedReviewDTO
    {
        [Required]
        public int ReviewId { get; set; }
    }
} 