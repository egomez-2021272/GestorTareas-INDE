using TaskService.Application.DTOs;
using TaskService.Application.Interfaces;
using TaskService.Application.Extensions;
using TaskService.Domain.Entities;
using TaskService.Domain.Interfaces;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace TaskService.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public NotificationService(INotificationRepository repository, HttpClient httpClient, IConfiguration configuration)
    {
        _repository = repository;
        _httpClient = httpClient;
        _configuration = configuration;
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

    public async Task<NotificationDto> CreateNotificationWithEmailAsync(CreateNotificationDto createNotificationDto, string userEmail, string userName)
    {
        // Crear notificación en la base de datos
        var notification = await CreateNotificationAsync(createNotificationDto);

        // Enviar correo electrónico mediante el servicio de autenticación
        try
        {
            var authServiceUrl = _configuration["AuthService:Url"] ?? "http://localhost:3000";
            var emailPayload = new
            {
                email = userEmail,
                firstName = userName,
                notificationTitle = createNotificationDto.Title,
                notificationMessage = createNotificationDto.Message,
                notificationType = createNotificationDto.Type
            };

            var content = new StringContent(JsonSerializer.Serialize(emailPayload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{authServiceUrl}/indetasks/v1/auth/send-notification-email", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Error al enviar correo de notificación: {response.StatusCode} - {errorContent}");
            }
            else
            {
                Console.WriteLine($"Correo de notificación enviado exitosamente a {userEmail}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Excepción al enviar correo de notificación: {ex.Message}");
        }

        return notification;
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

        _repository.DeleteNotification(notification);
        return await _repository.SaveChangesAsync();
    }
}