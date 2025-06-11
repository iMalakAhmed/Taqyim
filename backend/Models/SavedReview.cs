using System.ComponentModel.DataAnnotations;

namespace Taqyim.Api.Models
{
    public class SavedReview
    {
        [Key]
        public int SavedReviewId { get; set; }

        public int ReviewId { get; set; }
        public Review Review { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}
