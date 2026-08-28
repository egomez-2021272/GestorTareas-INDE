using System.Diagnostics;
using Microsoft.Extensions.Configuration;
using TaskService.Application.Interfaces;

namespace TaskService.Application.Services;

public class DatabaseBackupService : IDatabaseBackupService
{
    private readonly IConfiguration _configuration;

    public DatabaseBackupService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<byte[]> CreateBackupAsync()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        var builder = new System.Data.Common.DbConnectionStringBuilder { ConnectionString = connectionString };
        
        var host = builder.TryGetValue("Host", out var h) ? h.ToString() : (builder.TryGetValue("Server", out var s) ? s.ToString() : "localhost");
        var port = builder.TryGetValue("Port", out var p) ? p.ToString() : "5432";
        var username = builder.TryGetValue("Username", out var u) ? u.ToString() : (builder.TryGetValue("User ID", out var uid) ? uid.ToString() : "postgres");
        var database = builder.TryGetValue("Database", out var d) ? d.ToString() : "";
        var password = builder.TryGetValue("Password", out var pwd) ? pwd.ToString() : "";

        var backupFileName = $"backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql";
        var backupFilePath = Path.Combine(Path.GetTempPath(), backupFileName);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "pg_dump",
                Arguments = $"-h {host} -p {port} -U {username} -d {database} -F c -f \"{backupFilePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            // Set password environment variable
            startInfo.Environment["PGPASSWORD"] = password;

            using var process = Process.Start(startInfo);
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"pg_dump failed with exit code {process.ExitCode}");
            }

            var backupData = await File.ReadAllBytesAsync(backupFilePath);
            File.Delete(backupFilePath);

            return backupData;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error creating database backup: {ex.Message}", ex);
        }
    }

    public async Task<byte[]> CreateSchemaBackupAsync()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        var builder = new System.Data.Common.DbConnectionStringBuilder { ConnectionString = connectionString };
        
        var host = builder.TryGetValue("Host", out var h) ? h.ToString() : (builder.TryGetValue("Server", out var s) ? s.ToString() : "localhost");
        var port = builder.TryGetValue("Port", out var p) ? p.ToString() : "5432";
        var username = builder.TryGetValue("Username", out var u) ? u.ToString() : (builder.TryGetValue("User ID", out var uid) ? uid.ToString() : "postgres");
        var database = builder.TryGetValue("Database", out var d) ? d.ToString() : "";
        var password = builder.TryGetValue("Password", out var pwd) ? pwd.ToString() : "";

        var backupFileName = $"schema_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql";
        var backupFilePath = Path.Combine(Path.GetTempPath(), backupFileName);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "pg_dump",
                Arguments = $"-h {host} -p {port} -U {username} -d {database} --schema-only -f \"{backupFilePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            startInfo.Environment["PGPASSWORD"] = password;

            using var process = Process.Start(startInfo);
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"pg_dump failed with exit code {process.ExitCode}");
            }

            var backupData = await File.ReadAllBytesAsync(backupFilePath);
            File.Delete(backupFilePath);

            return backupData;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error creating schema backup: {ex.Message}", ex);
        }
    }

    public async Task<byte[]> CreateDataBackupAsync()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        var builder = new System.Data.Common.DbConnectionStringBuilder { ConnectionString = connectionString };
        
        var host = builder.TryGetValue("Host", out var h) ? h.ToString() : (builder.TryGetValue("Server", out var s) ? s.ToString() : "localhost");
        var port = builder.TryGetValue("Port", out var p) ? p.ToString() : "5432";
        var username = builder.TryGetValue("Username", out var u) ? u.ToString() : (builder.TryGetValue("User ID", out var uid) ? uid.ToString() : "postgres");
        var database = builder.TryGetValue("Database", out var d) ? d.ToString() : "";
        var password = builder.TryGetValue("Password", out var pwd) ? pwd.ToString() : "";

        var backupFileName = $"data_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql";
        var backupFilePath = Path.Combine(Path.GetTempPath(), backupFileName);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "pg_dump",
                Arguments = $"-h {host} -p {port} -U {username} -d {database} --data-only -f \"{backupFilePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            startInfo.Environment["PGPASSWORD"] = password;

            using var process = Process.Start(startInfo);
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"pg_dump failed with exit code {process.ExitCode}");
            }

            var backupData = await File.ReadAllBytesAsync(backupFilePath);
            File.Delete(backupFilePath);

            return backupData;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error creating data backup: {ex.Message}", ex);
        }
    }
}