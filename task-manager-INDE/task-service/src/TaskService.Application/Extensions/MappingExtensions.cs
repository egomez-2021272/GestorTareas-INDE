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
        Status = task.Status.ToString(),
        CreatedAt = task.CreatedAt,
        UpdatedAt = task.UpdatedAt,
        UserId = task.UserId,
        Tags = task.Tags.Select(t => t.ToDto()).ToList() //transforma la lista de la db a su versin segur para enviar a la web

    };

    public static TagDto ToDto(this Tag tag) => new()
    {
        Id = tag.Id,
        Name = tag.Name,
        Color = tag.Color
    };

    //validacion: si se mete un texto que no es no lo lee el código
    public static Domain.Enums.TaskStatus ToEnum(this string statusStr) =>
        Enum.TryParse<Domain.Enums.TaskStatus>(statusStr, true, out var status) ? status : Domain.Enums.TaskStatus.ToDo;
}