using TaskService.Application.DTOs;
using TaskService.Application.Interfaces;
using TaskService.Application.Extensions;
using TaskService.Domain.Entities;
using TaskService.Domain.Interfaces;

namespace TaskService.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;

    public NotificationService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId)
    {
        var notifications = await _repository.GetUserNotificationsAsync(userId);
        return notifications.Select(n => n.ToDto());
    }

    public async Task<NotificationDto?> GetNotificationByIdAsync(Guid id)
    {
        var notification = await _repository.GetNotificationByIdAsync(id);
        return notification?.ToDto();
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto)
    {
        var notification = new Notification
        {
            UserId = createNotificationDto.UserId,
            Title = createNotificationDto.Title,
            Message = createNotificationDto.Message,
            Type = createNotificationDto.Type,
            RelatedTaskId = createNotificationDto.RelatedTaskId,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddNotificationAsync(notification);
        await _repository.SaveChangesAsync();

        return notification.ToDto();
    }

    public async Task<bool> MarkAsReadAsync(Guid id)
    {
        return await _repository.MarkAsReadAsync(id);
    }

    public async Task<bool> MarkAllAsReadAsync(Guid userId)
    {
        return await _repository.MarkAllAsReadAsync(userId);
    }

    public async Task<bool> DeleteNotificationAsync(Guid id)
    {
        var notification = await _repository.GetNotificationByIdAsync(id);
        if (notification == null) return false;

        _repository.UpdateNotification(notification);
        return await _repository.SaveChangesAsync();
    }
}