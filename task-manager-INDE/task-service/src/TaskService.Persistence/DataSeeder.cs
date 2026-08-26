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

        var tagNoUrge = new Tag { Id = Guid.NewGuid(), Name = "No urge", Color = "#669a71" };
        var tagUrgente = new Tag { Id = Guid.NewGuid(), Name = "Urgente", Color = "#c95d5d" };
        var tagMedioUrge = new Tag { Id = Guid.NewGuid(), Name = "Medio urge", Color = "#c0914e" };

        await context.Tags.AddRangeAsync(tagNoUrge, tagUrgente, tagMedioUrge);

        await context.SaveChangesAsync();
    }
}
