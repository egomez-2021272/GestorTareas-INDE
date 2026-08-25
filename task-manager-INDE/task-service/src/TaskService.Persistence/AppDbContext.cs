using Microsoft.EntityFrameworkCore;
using TaskService.Domain.Entities;

namespace TaskService.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de la relación Muchos a Muchos entre Tareas y Etiquetas
        modelBuilder.Entity<TaskItem>()
            .HasMany(t => t.Tags)
            .WithMany(t => t.Tasks)
            .UsingEntity(j => j.ToTable("task_item_tags"));

        // Mapeo y restricciones para la tabla de Tareas
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Status).HasConversion<int>().IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // Mapeo y restricciones para la tabla de Etiquetas
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Color).IsRequired().HasMaxLength(7); 
        });
    }
}

//Mapea las entidades de Dominio a tablas de PostgreSQL usando Entity Framework Core.