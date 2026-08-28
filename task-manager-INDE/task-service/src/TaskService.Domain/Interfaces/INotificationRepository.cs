using TaskService.Domain.Entities;

namespace TaskService.Domain.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId);
    Task<Notification?> GetNotificationByIdAsync(Guid id);
    Task AddNotificationAsync(Notification notification);
    void UpdateNotification(Notification notification);
    Task<bool> MarkAsReadAsync(Guid id);
    Task<bool> MarkAllAsReadAsync(Guid userId);
    Task<bool> SaveChangesAsync();
}