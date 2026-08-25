using TaskService.Domain.Entities;
using TaskService.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace TaskService.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Tasks.AnyAsync() || await context.Tags.AnyAsync())
        {
            return;
        }

        var tagPersonal = new Tag { Id = Guid.NewGuid(), Name = "Personal", Color = "#00FF00" };
        var tagWork = new Tag { Id = Guid.NewGuid(), Name = "Trabajo", Color = "#FF0000" };
        var tagImportant = new Tag { Id = Guid.NewGuid(), Name = "Importante", Color = "#FFA500" };

        await context.Tags.AddRangeAsync(tagPersonal, tagWork, tagImportant);

        var task1 = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Diseñar base de datos",
            Description = "Definir tablas y relaciones para el gestor de tareas.",
            Status = Domain.Enums.TaskStatus.Completed,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            Tags = new List<Tag> { tagWork, tagImportant }
        };

        var task2 = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Implementar Controladores en .NET Core",
            Description = "Desarrollar controladores TasksController y TagsController para la API.",
            Status = Domain.Enums.TaskStatus.InProgress,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            Tags = new List<Tag> { tagWork }
        };

        var task3 = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Configurar Docker y PostgreSQL",
            Description = "Escribir el docker-compose y verificar conexión.",
            Status = Domain.Enums.TaskStatus.ToDo,
            CreatedAt = DateTime.UtcNow,
            Tags = new List<Tag> { tagPersonal }
        };

        await context.Tasks.AddRangeAsync(task1, task2, task3);

        await context.SaveChangesAsync();
    }
}
