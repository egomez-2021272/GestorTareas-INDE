using TaskService.Domain.Enums;

namespace TaskService.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.ToDo; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Guid? UserId { get; set; }
    public string? AssignedToName { get; set; }
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
//Representa una tarjeta o la tarea en un tablero