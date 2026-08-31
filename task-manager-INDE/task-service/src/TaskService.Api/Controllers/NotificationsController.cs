using Microsoft.AspNetCore.Mvc;
using TaskService.Application.DTOs;
using TaskService.Application.Interfaces;

namespace TaskService.Api.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUserNotifications(Guid userId)
    {
        var notifications = await _notificationService.GetUserNotificationsAsync(userId);
        return Ok(notifications);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NotificationDto>> GetNotificationById(Guid id)
    {
        var notification = await _notificationService.GetNotificationByIdAsync(id);
        if (notification == null)
        {
            return NotFound("Notificación no encontrada.");
        }
        return Ok(notification);
    }

    [HttpPost]
    public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] CreateNotificationDto dto)
    {
        var createdNotification = await _notificationService.CreateNotificationAsync(dto);
        return CreatedAtAction(nameof(GetNotificationById), new { id = createdNotification.Id }, createdNotification);
    }

    [HttpPost("with-email")]
    public async Task<ActionResult<NotificationDto>> CreateNotificationWithEmail([FromBody] CreateNotificationWithEmailDto dto)
    {
        var createdNotification = await _notificationService.CreateNotificationWithEmailAsync(dto.Notification, dto.UserEmail, dto.UserName);
        return CreatedAtAction(nameof(GetNotificationById), new { id = createdNotification.Id }, createdNotification);
    }

    [HttpPut("{id:guid}/mark-read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var success = await _notificationService.MarkAsReadAsync(id);
        if (!success)
        {
            return NotFound("Notificación no encontrada.");
        }
        return Ok("Notificación marcada como leída.");
    }

    [HttpPut("user/{userId:guid}/mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead(Guid userId)
    {
        var success = await _notificationService.MarkAllAsReadAsync(userId);
        return Ok("Todas las notificaciones marcadas como leídas.");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var success = await _notificationService.DeleteNotificationAsync(id);
        if (!success)
        {
            return NotFound("Notificación no encontrada.");
        }
        return NoContent();
    }
}