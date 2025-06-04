using System;
using System.Collections.Generic;

namespace Taqyim.Api.DTOs;

public class MessageDTO
{
    public int MessageId { get; set; }
    public int ConversationId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public required UserDTO Sender { get; set; }
}

public class CreateMessageDTO
{
    public int ConversationId { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class ConversationDTO
{
    public int ConversationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public string? Name { get; set; }
    public bool IsGroup { get; set; }
    public required ICollection<UserDTO> Users { get; set; }
    public ICollection<MessageDTO>? Messages { get; set; }
}

public class CreateConversationDTO
{
    public List<int> UserIds { get; set; } = new();
    public string? Name { get; set; }
    public bool IsGroup { get; set; }
}

public class UpdateConversationDTO
{
    public string? Name { get; set; }
    public List<int>? AddUserIds { get; set; }
    public List<int>? RemoveUserIds { get; set; }
} 