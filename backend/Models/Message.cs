using System;
using System.Collections.Generic;

namespace Taqyim.Api.Models;

public partial class Message
{
    public int MessageId { get; set; }
    public string Body { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public bool Seen { get; set; }
    public int ConversationId { get; set; }
    public int SenderId { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public User Sender { get; set; } = null!;
}
