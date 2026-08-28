using Microsoft.AspNetCore.Mvc;
using TaskService.Application.Interfaces;

namespace TaskService.Api.Controllers;

[ApiController]
[Route("api/backups")]
public class BackupsController : ControllerBase
{
    private readonly IDatabaseBackupService _backupService;

    public BackupsController(IDatabaseBackupService backupService)
    {
        _backupService = backupService;
    }

    [HttpGet("download")]
    public async Task<IActionResult> DownloadBackup()
    {
        try
        {
            var data = await _backupService.CreateBackupAsync();
            return File(data, "application/octet-stream", $"backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al crear copia de seguridad: {ex.Message}");
        }
    }

    [HttpGet("download/schema")]
    public async Task<IActionResult> DownloadSchemaBackup()
    {
        try
        {
            var data = await _backupService.CreateSchemaBackupAsync();
            return File(data, "application/octet-stream", $"schema_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al crear copia de seguridad del esquema: {ex.Message}");
        }
    }

    [HttpGet("download/data")]
    public async Task<IActionResult> DownloadDataBackup()
    {
        try
        {
            var data = await _backupService.CreateDataBackupAsync();
            return File(data, "application/octet-stream", $"data_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al crear copia de seguridad de datos: {ex.Message}");
        }
    }
}
