namespace TaskService.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // CREATE_TASK, UPDATE_TASK, DELETE_TASK, ASSIGN_TASK, etc.
    public string EntityType { get; set; } = string.Empty; // Task, User, etc.
    public string? EntityId { get; set; }
    public string? Description { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? OldValues { get; set; } // JSON string de valores anteriores
    public string? NewValues { get; set; } // JSON string de valores nuevos
}