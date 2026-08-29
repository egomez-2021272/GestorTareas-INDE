using TaskService.Domain.Enums;

namespace TaskService.Application.DTOs;

public class TaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string AcceptanceCriteria { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDisabled { get; set; }
    public ICollection<TaskAssignmentDto> AssignedUsers { get; set; } = new List<TaskAssignmentDto>();
    public ICollection<TagDto> Tags { get; set; } = new List<TagDto>();
}

public class TaskAssignmentDto
{
    public Guid UserId { get; set; }
    public string AssignedToName { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
}
