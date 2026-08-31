using TaskService.Application.DTOs;
using TaskService.Application.Interfaces;
using TaskService.Application.Extensions;
using TaskService.Domain.Entities;
using TaskService.Domain.Interfaces;
using TaskService.Domain.Enums;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TaskStatus = TaskService.Domain.Enums.TaskStatus;
//intermediario de los controladores
namespace TaskService.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;
    private readonly INotificationService _notificationService;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public TaskService(ITaskRepository repository, INotificationService notificationService, HttpClient httpClient, IConfiguration configuration)
    {
        _repository = repository;
        _notificationService = notificationService;
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync(Guid? userId = null)
    {
        var tasks = await _repository.GetAllTasksAsync(userId);
        return tasks.Select(t => t.ToDto());
    }

    public async Task<TaskDto?> GetTaskByIdAsync(Guid id)
    {
        var task = await _repository.GetTaskByIdAsync(id);
        return task?.ToDto();
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto)
    {
        var task = new TaskItem
        {
            Title = createTaskDto.Title,
            Description = createTaskDto.Description,
            AcceptanceCriteria = createTaskDto.AcceptanceCriteria,
            Status = createTaskDto.Status.ToEnum(),
            CreatedAt = DateTime.UtcNow
        };

        // Crear asignaciones de usuarios
        var userIdsList = createTaskDto.UserIds.ToList();
        var assignedToNamesList = createTaskDto.AssignedToNames.ToList();
        
        for (int i = 0; i < userIdsList.Count; i++)
        {
            task.TaskAssignments.Add(new TaskAssignment
            {
                UserId = userIdsList[i],
                AssignedToName = assignedToNamesList[i],
                AssignedAt = DateTime.UtcNow
            });
        }

        await _repository.AddTaskAsync(task);
        await _repository.SaveChangesAsync();

        // Enviar notificación a cada usuario asignado después de crear la tarea
        foreach (var assignment in task.TaskAssignments)
        {
            // Obtener información del usuario desde el servicio de autenticación
            var userInfo = await GetUserInfoAsync(assignment.UserId);
            
            if (userInfo != null)
            {
                await _notificationService.CreateNotificationWithEmailAsync(new CreateNotificationDto
                {
                    UserId = assignment.UserId,
                    Title = "Nueva Tarea Asignada",
                    Message = $"Has sido asignado a la tarea: {task.Title}",
                    Type = "TASK_ASSIGNMENT",
                    RelatedTaskId = task.Id
                }, userInfo.Email, userInfo.Name);
            }
            else
            {
                // Fallback si no se puede obtener información del usuario
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = assignment.UserId,
                    Title = "Nueva Tarea Asignada",
                    Message = $"Has sido asignado a la tarea: {task.Title}",
                    Type = "TASK_ASSIGNMENT",
                    RelatedTaskId = task.Id
                });
            }
        }

        return task.ToDto();
    }

    public async Task<TaskDto?> UpdateTaskAsync(Guid id, UpdateTaskDto updateTaskDto)
    {
        var task = await _repository.GetTaskByIdAsync(id);
        if (task == null) return null;

        // Guardar el estado anterior para detectar cambios
        var previousStatus = task.Status;

        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.AcceptanceCriteria = updateTaskDto.AcceptanceCriteria;
        task.Status = updateTaskDto.Status.ToEnum();
        task.IsDisabled = updateTaskDto.IsDisabled;
        task.UpdatedAt = DateTime.UtcNow;

        // Actualizar asignaciones de usuarios
        task.TaskAssignments.Clear();
        var userIdsList = updateTaskDto.UserIds.ToList();
        var assignedToNamesList = updateTaskDto.AssignedToNames.ToList();
        
        for (int i = 0; i < userIdsList.Count; i++)
        {
            task.TaskAssignments.Add(new TaskAssignment
            {
                UserId = userIdsList[i],
                AssignedToName = assignedToNamesList[i],
                AssignedAt = DateTime.UtcNow
            });
        }

        _repository.UpdateTask(task);
        await _repository.SaveChangesAsync();

        // Enviar notificación si el estado cambió
        if (previousStatus != task.Status)
        {
            var statusLabel = GetStatusLabel(task.Status);
            var previousStatusLabel = GetStatusLabel(previousStatus);

            foreach (var assignment in task.TaskAssignments)
            {
                // Obtener información del usuario desde el servicio de autenticación
                var userInfo = await GetUserInfoAsync(assignment.UserId);
                
                if (userInfo != null)
                {
                    await _notificationService.CreateNotificationWithEmailAsync(new CreateNotificationDto
                    {
                        UserId = assignment.UserId,
                        Title = "Estado de Tarea Actualizado",
                        Message = $"La tarea '{task.Title}' cambió de estado: {previousStatusLabel} → {statusLabel}",
                        Type = "TASK_UPDATE",
                        RelatedTaskId = task.Id
                    }, userInfo.Email, userInfo.Name);
                }
                else
                {
                    // Fallback si no se puede obtener información del usuario
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = assignment.UserId,
                        Title = "Estado de Tarea Actualizado",
                        Message = $"La tarea '{task.Title}' cambió de estado: {previousStatusLabel} → {statusLabel}",
                        Type = "TASK_UPDATE",
                        RelatedTaskId = task.Id
                    });
                }
            }
        }

        return task.ToDto();
    }

    public async Task<bool> DeleteTaskAsync(Guid id)
    {
        var task = await _repository.GetTaskByIdAsync(id);
        if (task == null) return false;

        // Soft delete: cambiar estado IsDisabled en lugar de eliminar
        task.IsDisabled = true;
        task.UpdatedAt = DateTime.UtcNow;
        
        _repository.UpdateTask(task);
        return await _repository.SaveChangesAsync();
    }

    public async Task<IEnumerable<TagDto>> GetAllTagsAsync()
    {
        var tags = await _repository.GetAllTagsAsync();
        return tags.Select(t => t.ToDto());
    }

    public async Task<TagDto?> GetTagByIdAsync(Guid id)
    {
        var tag = await _repository.GetTagByIdAsync(id);
        return tag?.ToDto();
    }

    public async Task<TagDto> CreateTagAsync(CreateTagDto createTagDto)
    {
        var tag = new Tag
        {
            Name = createTagDto.Name,
            Color = createTagDto.Color
        };

        await _repository.AddTagAsync(tag);
        await _repository.SaveChangesAsync();

        return tag.ToDto();
    }

    public async Task<bool> DeleteTagAsync(Guid id)
    {
        var tag = await _repository.GetTagByIdAsync(id);
        if (tag == null) return false;

        _repository.DeleteTag(tag);
        return await _repository.SaveChangesAsync();
    }

    public async Task<bool> AssignTagToTaskAsync(Guid taskId, Guid tagId)
    {
        var task = await _repository.GetTaskByIdAsync(taskId);
        if (task == null) return false;

        var tag = await _repository.GetTagByIdAsync(tagId);
        if (tag == null) return false;

        if (task.Tags.Any(t => t.Id == tagId)) return true;

        task.Tags.Add(tag);
        _repository.UpdateTask(task);
        return await _repository.SaveChangesAsync();
    }

    public async Task<bool> RemoveTagFromTaskAsync(Guid taskId, Guid tagId)
    {
        var task = await _repository.GetTaskByIdAsync(taskId);
        if (task == null) return false;

        var tag = task.Tags.FirstOrDefault(t => t.Id == tagId);
        if (tag == null) return false;

        task.Tags.Remove(tag);
        _repository.UpdateTask(task);
        return await _repository.SaveChangesAsync();
    }

    private async Task<UserInfo?> GetUserInfoAsync(Guid userId)
    {
        try
        {
            var authServiceUrl = _configuration["AuthService:Url"] ?? "http://localhost:3000";
            Console.WriteLine($"Intentando obtener información del usuario {userId} desde {authServiceUrl}/indetasks/v1/auth/users/{userId}");
            
            var response = await _httpClient.GetAsync($"{authServiceUrl}/indetasks/v1/auth/users/{userId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Información de usuario recibida: {content}");
                var userResponse = JsonSerializer.Deserialize<UserResponse>(content, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                
                if (userResponse?.Data != null)
                {
                    return new UserInfo
                    {
                        Email = userResponse.Data.Email,
                        Name = $"{userResponse.Data.FirstName} {userResponse.Data.Surname}"
                    };
                }
            }
            else
            {
                Console.WriteLine($"Error al obtener usuario: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Excepción al obtener información del usuario: {ex.Message}");
        }
        
        return null;
    }

    private class UserInfo
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    private class UserResponse
    {
        public UserData? Data { get; set; }
    }

    private class UserData
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
    }

    private string GetStatusLabel(TaskStatus status)
    {
        return status switch
        {
            TaskStatus.ToDo => "Por Hacer",
            TaskStatus.InProgress => "En Proceso",
            TaskStatus.Pending => "En Espera",
            TaskStatus.Completed => "Completado",
            _ => status.ToString()
        };
    }
}
