using Microsoft.EntityFrameworkCore;
using TaskService.Domain.Entities;
using TaskService.Domain.Interfaces;

namespace TaskService.Persistence.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context; // Declara la variable para interactuar con la BD.

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TaskItem>> GetAllTasksAsync(Guid? userId = null)
    {
        var query = _context.Tasks
            .Include(t => t.Tags)
            .Include(t => t.TaskAssignments)
            .AsQueryable();
        
        // No incluir tareas deshabilitadas
        query = query.Where(t => !t.IsDisabled);
        
        if (userId.HasValue)
        {
            query = query.Where(t => t.TaskAssignments.Any(ta => ta.UserId == userId.Value));
        }
        return await query.ToListAsync();
    }
 // Busca una tarea por su ID e incluye de forma activa sus etiquetas asociadas y asignaciones de usuarios.
    public async Task<TaskItem?> GetTaskByIdAsync(Guid id)
    {
        return await _context.Tasks
            .Include(t => t.Tags)
            .Include(t => t.TaskAssignments)
            .FirstOrDefaultAsync(t => t.Id == id);
    }
// Encola la inserción de una tarea nueva en memoria.
    public async Task AddTaskAsync(TaskItem task)
    {
        await _context.Tasks.AddAsync(task);
    }

    public void UpdateTask(TaskItem task)
    {
        _context.Tasks.Update(task);
    }

    public void DeleteTask(TaskItem task)
    {
        _context.Tasks.Remove(task);
    }

    public async Task<IEnumerable<Tag>> GetAllTagsAsync()
    {
        return await _context.Tags.ToListAsync();
    }

    public async Task<Tag?> GetTagByIdAsync(Guid id)
    {
        return await _context.Tags.FindAsync(id);
    }

    public async Task AddTagAsync(Tag tag)
    {
        await _context.Tags.AddAsync(tag);
    }

    public void DeleteTag(Tag tag)
    {
        _context.Tags.Remove(tag);
    }

    // Ejecuta físicamente todas las operaciones preparadas en la base de datos.
    // Retorna true si se afectó al menos 1 fila en la BD.

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}

//Implementa la interfaz ITaskRepository para leer y escribir en PostgreSQL mediante AppDbContext.
//es el puente entre tu código y la base de datos (PostgreSQL).
