namespace TaskService.Domain.Entities;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty; 
   
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}

//Representa las etiquetas en formato hexadecimal