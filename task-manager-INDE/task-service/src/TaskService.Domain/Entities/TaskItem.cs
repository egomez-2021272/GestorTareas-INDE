using TaskService.Domain.Enums;

namespace TaskService.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string AcceptanceCriteria { get; set; } = string.Empty;
    public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.ToDo; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDisabled { get; set; } = false;

    // Relación muchos a muchos con usuarios a través de TaskAssignment
    public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
//Representa una tarjeta o la tarea en un tablero