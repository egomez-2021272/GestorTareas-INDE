namespace TaskService.Application.DTOs;

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "ToDo";
    public ICollection<Guid> UserIds { get; set; } = new List<Guid>();
    public ICollection<string> AssignedToNames { get; set; } = new List<string>();
}
