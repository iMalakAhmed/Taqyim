using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Taqyim.Api.Models;

public class SavedReview
{
    [Key]
    public int SavedReviewId { get; set; }
    public int UserId { get; set; }
    public int ReviewId { get; set; }
    public DateTime SavedAt { get; set; }

    [ForeignKey("UserId")]
    public required User User { get; set; }

    [ForeignKey("ReviewId")]
    public required Review Review { get; set; }
} 