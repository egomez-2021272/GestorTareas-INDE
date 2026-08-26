using TaskService.Domain.Entities;

namespace TaskService.Domain.Interfaces;

public interface ITaskRepository
{
    
    Task<IEnumerable<TaskItem>> GetAllTasksAsync(Guid? userId = null);
    Task<TaskItem?> GetTaskByIdAsync(Guid id);
    Task AddTaskAsync(TaskItem task);
    void UpdateTask(TaskItem task);
    void DeleteTask(TaskItem task);

   
    Task<IEnumerable<Tag>> GetAllTagsAsync();
    Task<Tag?> GetTagByIdAsync(Guid id);
    Task AddTagAsync(Tag tag);
    void DeleteTag(Tag tag);

   
    Task<bool> SaveChangesAsync();
}

//El contrato que define cómo interactuar con los datos.