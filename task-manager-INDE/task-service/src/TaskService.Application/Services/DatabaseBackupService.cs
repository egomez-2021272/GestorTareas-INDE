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

    private (string host, string port, string username, string database, string password) GetConnectionParams()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        var builder = new System.Data.Common.DbConnectionStringBuilder { ConnectionString = connectionString };

        var host = builder.TryGetValue("Host", out var h) ? h.ToString() : (builder.TryGetValue("Server", out var s) ? s.ToString() : "localhost");
        var port = builder.TryGetValue("Port", out var p) ? p.ToString() : "5432";
        var username = builder.TryGetValue("Username", out var u) ? u.ToString() : (builder.TryGetValue("User ID", out var uid) ? uid.ToString() : "postgres");
        var database = builder.TryGetValue("Database", out var d) ? d.ToString() : "";
        var password = builder.TryGetValue("Password", out var pwd) ? pwd.ToString() : "";

        return (host, port, username, database, password);
    }

    private string GetPgDumpPath()
    {
        // Configurable desde appsettings.json; si no está configurado, usa la ruta típica de PG 13
        return _configuration["PostgresTools:PgDumpPath"]
            ?? @"C:\Program Files\PostgreSQL\13\bin\pg_dump.exe";
    }

    public async Task<byte[]> CreateBackupAsync()
    {
        var (host, port, username, database, password) = GetConnectionParams();
        var pgDumpPath = GetPgDumpPath();

        var backupFileName = $"backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql";
        var backupFilePath = Path.Combine(Path.GetTempPath(), backupFileName);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = pgDumpPath,
                // -F p = texto plano (SQL legible, restaurable con psql o pgAdmin Query Tool)
                Arguments = $"-h {host} -p {port} -U {username} -d {database} -F p --no-owner --no-privileges -f \"{backupFilePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            startInfo.Environment["PGPASSWORD"] = password;

            using var process = Process.Start(startInfo);
            if (process == null)
                throw new Exception($"No se pudo iniciar pg_dump. Verifica la ruta: {pgDumpPath}");

            string stdErr = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"pg_dump falló (código {process.ExitCode}): {stdErr}");
            }

            var backupData = await File.ReadAllBytesAsync(backupFilePath);
            return backupData;
        }
        finally
        {
            if (File.Exists(backupFilePath))
                File.Delete(backupFilePath);
        }
    }

    public async Task<byte[]> CreateSchemaBackupAsync()
    {
        var (host, port, username, database, password) = GetConnectionParams();
        var pgDumpPath = GetPgDumpPath();

        var backupFileName = $"schema_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql";
        var backupFilePath = Path.Combine(Path.GetTempPath(), backupFileName);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = pgDumpPath,
                Arguments = $"-h {host} -p {port} -U {username} -d {database} --schema-only -F p -f \"{backupFilePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            startInfo.Environment["PGPASSWORD"] = password;

            using var process = Process.Start(startInfo);
            if (process == null)
                throw new Exception($"No se pudo iniciar pg_dump. Verifica la ruta: {pgDumpPath}");

            string stdErr = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
                throw new Exception($"pg_dump falló (código {process.ExitCode}): {stdErr}");

            var backupData = await File.ReadAllBytesAsync(backupFilePath);
            return backupData;
        }
        finally
        {
            if (File.Exists(backupFilePath))
                File.Delete(backupFilePath);
        }
    }

    public async Task<byte[]> CreateDataBackupAsync()
    {
        var (host, port, username, database, password) = GetConnectionParams();
        var pgDumpPath = GetPgDumpPath();

        var backupFileName = $"data_backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.sql";
        var backupFilePath = Path.Combine(Path.GetTempPath(), backupFileName);

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = pgDumpPath,
                Arguments = $"-h {host} -p {port} -U {username} -d {database} --data-only -F p -f \"{backupFilePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            startInfo.Environment["PGPASSWORD"] = password;

            using var process = Process.Start(startInfo);
            if (process == null)
                throw new Exception($"No se pudo iniciar pg_dump. Verifica la ruta: {pgDumpPath}");

            string stdErr = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
                throw new Exception($"pg_dump falló (código {process.ExitCode}): {stdErr}");

            var backupData = await File.ReadAllBytesAsync(backupFilePath);
            return backupData;
        }
        finally
        {
            if (File.Exists(backupFilePath))
                File.Delete(backupFilePath);
        }
    }
}