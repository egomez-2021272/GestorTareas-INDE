namespace TaskService.Domain.Entities;

public class TaskAssignment
{
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public string AssignedToName { get; set; } = string.Empty;
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}