using TaskService.Application.DTOs;

namespace TaskService.Application.Interfaces;

public interface IAuditLogService
{
    Task<IEnumerable<AuditLogDto>> GetAllAuditLogsAsync();
    Task<IEnumerable<AuditLogDto>> GetUserAuditLogsAsync(Guid userId);
    Task<AuditLogDto?> GetAuditLogByIdAsync(Guid id);
    Task<AuditLogDto> CreateAuditLogAsync(CreateAuditLogDto createAuditLogDto);
    Task<IEnumerable<AuditLogDto>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<byte[]> ExportAuditLogsToCsvAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<byte[]> ExportAuditLogsToJsonAsync(DateTime? startDate = null, DateTime? endDate = null);
}