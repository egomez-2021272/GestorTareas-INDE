namespace TaskService.Application.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? RelatedTaskId { get; set; }
}

public class CreateNotificationDto
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "TASK_ASSIGNMENT";
    public Guid? RelatedTaskId { get; set; }
}

public class CreateNotificationWithEmailDto
{
    public CreateNotificationDto Notification { get; set; } = new();
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}