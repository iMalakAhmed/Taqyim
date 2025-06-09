using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Taqyim.Api.Models;

public class Media
{
    [Key]
    public int MediaId { get; set; }
    public int UserId { get; set; }
     public int? ReviewId { get; set; } 
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }

    [ForeignKey("UserId")]
    public required User User { get; set; }
} 