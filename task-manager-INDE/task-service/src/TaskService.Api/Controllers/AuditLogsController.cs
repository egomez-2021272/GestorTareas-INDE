using Microsoft.AspNetCore.Mvc;
using TaskService.Application.DTOs;
using TaskService.Application.Interfaces;

namespace TaskService.Api.Controllers;

[ApiController]
[Route("api/auditlogs")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAllAuditLogs()
    {
        var logs = await _auditLogService.GetAllAuditLogsAsync();
        return Ok(logs);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetUserAuditLogs(Guid userId)
    {
        var logs = await _auditLogService.GetUserAuditLogsAsync(userId);
        return Ok(logs);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuditLogDto>> GetAuditLogById(Guid id)
    {
        var log = await _auditLogService.GetAuditLogByIdAsync(id);
        if (log == null)
        {
            return NotFound("Registro de auditoría no encontrado.");
        }
        return Ok(log);
    }

    [HttpGet("range")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAuditLogsByDateRange(
        [FromQuery] DateTime startDate, 
        [FromQuery] DateTime endDate)
    {
        var logs = await _auditLogService.GetAuditLogsByDateRangeAsync(startDate, endDate);
        return Ok(logs);
    }

    [HttpPost]
    public async Task<ActionResult<AuditLogDto>> CreateAuditLog([FromBody] CreateAuditLogDto dto)
    {
        var createdLog = await _auditLogService.CreateAuditLogAsync(dto);
        return CreatedAtAction(nameof(GetAuditLogById), new { id = createdLog.Id }, createdLog);
    }

    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportToCsv(
        [FromQuery] DateTime? startDate = null, 
        [FromQuery] DateTime? endDate = null)
    {
        var csvData = await _auditLogService.ExportAuditLogsToCsvAsync(startDate, endDate);
        return File(csvData, "text/csv", $"audit_logs_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }

    [HttpGet("export/json")]
    public async Task<IActionResult> ExportToJson(
        [FromQuery] DateTime? startDate = null, 
        [FromQuery] DateTime? endDate = null)
    {
        var jsonData = await _auditLogService.ExportAuditLogsToJsonAsync(startDate, endDate);
        return File(jsonData, "application/json", $"audit_logs_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json");
    }
}