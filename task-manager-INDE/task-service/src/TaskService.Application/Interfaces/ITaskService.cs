using TaskService.Application.DTOs;

namespace TaskService.Application.Interfaces;

public interface ITaskService
{
    
    Task<IEnumerable<TaskDto>> GetAllTasksAsync();
    Task<TaskDto?> GetTaskByIdAsync(Guid id);
    Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto);
    Task<TaskDto?> UpdateTaskAsync(Guid id, UpdateTaskDto updateTaskDto);
    Task<bool> DeleteTaskAsync(Guid id);

    Task<IEnumerable<TagDto>> GetAllTagsAsync();
    Task<TagDto?> GetTagByIdAsync(Guid id);
    Task<TagDto> CreateTagAsync(CreateTagDto createTagDto);
    Task<bool> DeleteTagAsync(Guid id);

    Task<bool> AssignTagToTaskAsync(Guid taskId, Guid tagId);
    Task<bool> RemoveTagFromTaskAsync(Guid taskId, Guid tagId);
}
