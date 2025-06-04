using System;
using System.ComponentModel.DataAnnotations;

namespace Taqyim.Api.DTOs;

public class MediaDTO
{
    public int MediaId { get; set; }
    public int UserId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public UserDTO User { get; set; } = null!;
}

public class CreateMediaDTO
{
    [Required]
    public IFormFile File { get; set; } = null!;
} 