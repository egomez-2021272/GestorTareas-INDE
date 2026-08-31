using Microsoft.EntityFrameworkCore;
using TaskService.Domain.Entities;
using TaskService.Domain.Interfaces;

namespace TaskService.Persistence.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetNotificationByIdAsync(Guid id)
    {
        return await _context.Notifications.FindAsync(id);
    }

    public async Task AddNotificationAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
    }

    public void UpdateNotification(Notification notification)
    {
        _context.Notifications.Update(notification);
    }

    public void DeleteNotification(Notification notification)
    {
        _context.Notifications.Remove(notification);
    }

    public async Task<bool> MarkAsReadAsync(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return false;
        
        notification.IsRead = true;
        _context.Notifications.Update(notification);
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();
        
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }
        
        var result = await _context.SaveChangesAsync();
        return result > 0;
    }

    public async Task<bool> SaveChangesAsync()
    {
        try 
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }
}