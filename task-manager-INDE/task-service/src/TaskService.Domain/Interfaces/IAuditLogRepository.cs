using TaskService.Domain.Entities;

namespace TaskService.Domain.Interfaces;

public interface IAuditLogRepository
{
    Task<IEnumerable<AuditLog>> GetAllAuditLogsAsync();
    Task<IEnumerable<AuditLog>> GetUserAuditLogsAsync(Guid userId);
    Task<AuditLog?> GetAuditLogByIdAsync(Guid id);
    Task AddAuditLogAsync(AuditLog auditLog);
    Task<IEnumerable<AuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<bool> SaveChangesAsync();
}