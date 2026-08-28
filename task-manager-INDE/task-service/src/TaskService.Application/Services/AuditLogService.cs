using System.Text;
using System.Text.Json;
using TaskService.Application.DTOs;
using TaskService.Application.Interfaces;
using TaskService.Application.Extensions;
using TaskService.Domain.Interfaces;
using TaskService.Domain.Entities;

namespace TaskService.Application.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _repository;

    public AuditLogService(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AuditLogDto>> GetAllAuditLogsAsync()
    {
        var logs = await _repository.GetAllAuditLogsAsync();
        return logs.Select(l => l.ToDto());
    }

    public async Task<IEnumerable<AuditLogDto>> GetUserAuditLogsAsync(Guid userId)
    {
        var logs = await _repository.GetUserAuditLogsAsync(userId);
        return logs.Select(l => l.ToDto());
    }

    public async Task<AuditLogDto?> GetAuditLogByIdAsync(Guid id)
    {
        var log = await _repository.GetAuditLogByIdAsync(id);
        return log?.ToDto();
    }

    public async Task<AuditLogDto> CreateAuditLogAsync(CreateAuditLogDto createAuditLogDto)
    {
        var auditLog = new AuditLog
        {
            UserId = createAuditLogDto.UserId,
            UserName = createAuditLogDto.UserName,
            UserRole = createAuditLogDto.UserRole,
            Action = createAuditLogDto.Action,
            EntityType = createAuditLogDto.EntityType,
            EntityId = createAuditLogDto.EntityId,
            Description = createAuditLogDto.Description,
            IpAddress = createAuditLogDto.IpAddress,
            OldValues = createAuditLogDto.OldValues,
            NewValues = createAuditLogDto.NewValues,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAuditLogAsync(auditLog);
        await _repository.SaveChangesAsync();

        return auditLog.ToDto();
    }

    public async Task<IEnumerable<AuditLogDto>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var logs = await _repository.GetAuditLogsByDateRangeAsync(startDate, endDate);
        return logs.Select(l => l.ToDto());
    }

    public async Task<byte[]> ExportAuditLogsToCsvAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        IEnumerable<AuditLogDto> logs;
        
        if (startDate.HasValue && endDate.HasValue)
        {
            logs = await GetAuditLogsByDateRangeAsync(startDate.Value, endDate.Value);
        }
        else
        {
            logs = await GetAllAuditLogsAsync();
        }

        var csv = new StringBuilder();
        csv.AppendLine("ID,Fecha,Usuario,Rol,Acción,Tipo Entidad,ID Entidad,Descripción,Dirección IP");

        foreach (var log in logs)
        {
            csv.AppendLine($"{log.Id},{log.CreatedAt:yyyy-MM-dd HH:mm:ss},{log.UserName},{log.UserRole},{log.Action},{log.EntityType},{log.EntityId},{log.Description},{log.IpAddress}");
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<byte[]> ExportAuditLogsToJsonAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        IEnumerable<AuditLogDto> logs;
        
        if (startDate.HasValue && endDate.HasValue)
        {
            logs = await GetAuditLogsByDateRangeAsync(startDate.Value, endDate.Value);
        }
        else
        {
            logs = await GetAllAuditLogsAsync();
        }

        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(logs, options);
        return Encoding.UTF8.GetBytes(json);
    }
}