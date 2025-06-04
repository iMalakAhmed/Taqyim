using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Taqyim.Api.Data;
using Taqyim.Api.Models;
using Taqyim.Api.DTOs;

namespace Taqyim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessageController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MessageController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /api/message/conversations
    [Authorize]
    [HttpGet("conversations")]
    public async Task<ActionResult<IEnumerable<ConversationDTO>>> GetConversations()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var conversations = await _context.Conversations
            .Include(c => c.Users)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt))
            .Where(c => c.Users.Any(u => u.UserId == userId))
            .Select(c => new ConversationDTO
            {
                ConversationId = c.ConversationId,
                CreatedAt = c.CreatedAt,
                LastMessageAt = c.LastMessageAt,
                Name = c.Name,
                IsGroup = c.IsGroup,
                Users = c.Users.Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Type = u.Type,
                    IsVerified = u.IsVerified,
                    ProfilePic = u.ProfilePic,
                    Bio = u.Bio,
                    CreatedAt = u.CreatedAt,
                    ReputationPoints = u.ReputationPoints
                }).ToList(),
                Messages = c.Messages.Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    ConversationId = m.ConversationId,
                    SenderId = m.SenderId,
                    Content = m.Content,
                    CreatedAt = m.CreatedAt,
                    IsRead = false,
                    Sender = new UserDTO
                    {
                        UserId = m.Sender.UserId,
                        Email = m.Sender.Email,
                        FirstName = m.Sender.FirstName,
                        LastName = m.Sender.LastName,
                        Type = m.Sender.Type,
                        IsVerified = m.Sender.IsVerified,
                        ProfilePic = m.Sender.ProfilePic,
                        Bio = m.Sender.Bio,
                        CreatedAt = m.Sender.CreatedAt,
                        ReputationPoints = m.Sender.ReputationPoints
                    }
                }).ToList()
            })
            .ToListAsync();

        return conversations;
    }

    // GET: /api/message/conversations/{id}
    [Authorize]
    [HttpGet("conversations/{id}")]
    public async Task<ActionResult<ConversationDTO>> GetConversation(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var conversation = await _context.Conversations
            .Include(c => c.Users)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt))
                .ThenInclude(m => m.Sender)
            .FirstOrDefaultAsync(c => c.ConversationId == id && c.Users.Any(u => u.UserId == userId));

        if (conversation == null)
            return NotFound();

        return new ConversationDTO
        {
            ConversationId = conversation.ConversationId,
            CreatedAt = conversation.CreatedAt,
            LastMessageAt = conversation.LastMessageAt,
            Name = conversation.Name,
            IsGroup = conversation.IsGroup,
            Users = conversation.Users.Select(u => new UserDTO
            {
                UserId = u.UserId,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Type = u.Type,
                IsVerified = u.IsVerified,
                ProfilePic = u.ProfilePic,
                Bio = u.Bio,
                CreatedAt = u.CreatedAt,
                ReputationPoints = u.ReputationPoints
            }).ToList(),
            Messages = conversation.Messages.Select(m => new MessageDTO
            {
                MessageId = m.MessageId,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                Sender = new UserDTO
                {
                    UserId = m.Sender.UserId,
                    Email = m.Sender.Email,
                    FirstName = m.Sender.FirstName,
                    LastName = m.Sender.LastName,
                    Type = m.Sender.Type,
                    IsVerified = m.Sender.IsVerified,
                    ProfilePic = m.Sender.ProfilePic,
                    Bio = m.Sender.Bio,
                    CreatedAt = m.Sender.CreatedAt,
                    ReputationPoints = m.Sender.ReputationPoints
                }
            }).ToList()
        };
    }

    // POST: /api/message/conversations
    [Authorize]
    [HttpPost("conversations")]
    public async Task<ActionResult<ConversationDTO>> CreateConversation(CreateConversationDTO createConversationDTO)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var users = await _context.Users
            .Where(u => createConversationDTO.UserIds.Contains(u.UserId))
            .ToListAsync();

        if (users.Count != createConversationDTO.UserIds.Count)
            return BadRequest("One or more users not found");

        var conversation = new Conversation
        {
            CreatedAt = DateTime.UtcNow,
            LastMessageAt = DateTime.UtcNow,
            Name = createConversationDTO.Name,
            IsGroup = createConversationDTO.IsGroup,
            Users = users
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        return await GetConversation(conversation.ConversationId);
    }

    // PUT: /api/message/conversations/{id}
    [Authorize]
    [HttpPut("conversations/{id}")]
    public async Task<IActionResult> UpdateConversation(int id, UpdateConversationDTO updateConversationDTO)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var conversation = await _context.Conversations
            .Include(c => c.Users)
            .FirstOrDefaultAsync(c => c.ConversationId == id && c.Users.Any(u => u.UserId == userId));

        if (conversation == null)
            return NotFound();

        if (updateConversationDTO.Name != null)
            conversation.Name = updateConversationDTO.Name;

        if (updateConversationDTO.AddUserIds != null)
        {
            var usersToAdd = await _context.Users
                .Where(u => updateConversationDTO.AddUserIds.Contains(u.UserId))
                .ToListAsync();

            foreach (var user in usersToAdd)
            {
                if (!conversation.Users.Contains(user))
                    conversation.Users.Add(user);
            }
        }

        if (updateConversationDTO.RemoveUserIds != null)
        {
            var usersToRemove = conversation.Users
                .Where(u => updateConversationDTO.RemoveUserIds.Contains(u.UserId))
                .ToList();

            foreach (var user in usersToRemove)
            {
                if (user.UserId != userId) // Prevent removing self
                    conversation.Users.Remove(user);
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST: /api/message
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<MessageDTO>> SendMessage(CreateMessageDTO createMessageDTO)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var conversation = await _context.Conversations
            .Include(c => c.Users)
            .FirstOrDefaultAsync(c => c.ConversationId == createMessageDTO.ConversationId && c.Users.Any(u => u.UserId == userId));

        if (conversation == null)
            return NotFound("Conversation not found");

        var message = new Message
        {
            ConversationId = createMessageDTO.ConversationId,
            SenderId = userId,
            Content = createMessageDTO.Content,
            CreatedAt = DateTime.UtcNow
        };

        conversation.LastMessageAt = DateTime.UtcNow;
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var createdMessage = await _context.Messages
            .Include(m => m.Sender)
            .FirstOrDefaultAsync(m => m.MessageId == message.MessageId);

        return new MessageDTO
        {
            MessageId = createdMessage!.MessageId,
            ConversationId = createdMessage.ConversationId,
            SenderId = createdMessage.SenderId,
            Content = createdMessage.Content,
            CreatedAt = createdMessage.CreatedAt,
            Sender = new UserDTO
            {
                UserId = createdMessage.Sender.UserId,
                Email = createdMessage.Sender.Email,
                FirstName = createdMessage.Sender.FirstName,
                LastName = createdMessage.Sender.LastName,
                Type = createdMessage.Sender.Type,
                IsVerified = createdMessage.Sender.IsVerified,
                ProfilePic = createdMessage.Sender.ProfilePic,
                Bio = createdMessage.Sender.Bio,
                CreatedAt = createdMessage.Sender.CreatedAt,
                ReputationPoints = createdMessage.Sender.ReputationPoints
            }
        };
    }
} 