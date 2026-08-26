namespace TaskService.Application.DTOs;

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // los 3 que existen en el programa, en progreso, hecho, pendiente
    public Guid? UserId { get; set; }
    public string? AssignedToName { get; set; }
}