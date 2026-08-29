using TaskService.Domain.Entities;
using TaskService.Domain.Enums;
using TaskService.Application.DTOs;
 //archivo para mapear los objetos de un formato a otro en la db
 //no expone los modelos internos en la API

namespace TaskService.Application.Extensions;

public static class MappingExtensions
{
    public static TaskDto ToDto (this TaskItem task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Description = task.Description,
        AcceptanceCriteria = task.AcceptanceCriteria,
        Status = task.Status.ToString(),
        CreatedAt = task.CreatedAt,
        UpdatedAt = task.UpdatedAt,
        IsDisabled = task.IsDisabled,
        AssignedUsers = task.TaskAssignments.Select(ta => new TaskAssignmentDto
        {
            UserId = ta.UserId,
            AssignedToName = ta.AssignedToName,
            AssignedAt = ta.AssignedAt
        }).ToList(),
        Tags = task.Tags.Select(t => t.ToDto()).ToList() //transforma la lista de la db a su versin segur para enviar a la web

    };

    public static TagDto ToDto(this Tag tag) => new()
    {
        Id = tag.Id,
        Name = tag.Name,
        Color = tag.Color
    };

    public static NotificationDto ToDto(this Notification notification) => new()
    {
        Id = notification.Id,
        UserId = notification.UserId,
        Title = notification.Title,
        Message = notification.Message,
        Type = notification.Type,
        IsRead = notification.IsRead,
        CreatedAt = notification.CreatedAt,
        RelatedTaskId = notification.RelatedTaskId
    };

    public static AuditLogDto ToDto(this AuditLog auditLog) => new()
    {
        Id = auditLog.Id,
        UserId = auditLog.UserId,
        UserName = auditLog.UserName,
        UserRole = auditLog.UserRole,
        Action = auditLog.Action,
        EntityType = auditLog.EntityType,
        EntityId = auditLog.EntityId,
        Description = auditLog.Description,
        IpAddress = auditLog.IpAddress,
        CreatedAt = auditLog.CreatedAt,
        OldValues = auditLog.OldValues,
        NewValues = auditLog.NewValues
    };

    //validacion: si se mete un texto que no es no lo lee el código
    public static Domain.Enums.TaskStatus ToEnum(this string statusStr) =>
        Enum.TryParse<Domain.Enums.TaskStatus>(statusStr, true, out var status) ? status : Domain.Enums.TaskStatus.ToDo;
}