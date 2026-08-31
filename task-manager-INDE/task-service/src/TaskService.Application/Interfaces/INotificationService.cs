using TaskService.Application.DTOs;

namespace TaskService.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId);
    Task<NotificationDto?> GetNotificationByIdAsync(Guid id);
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto);
    Task<NotificationDto> CreateNotificationWithEmailAsync(CreateNotificationDto createNotificationDto, string userEmail, string userName);
    Task<bool> MarkAsReadAsync(Guid id);
    Task<bool> MarkAllAsReadAsync(Guid userId);
    Task<bool> DeleteNotificationAsync(Guid id);
}