using System.Threading.Tasks;

namespace TaskService.Application.Interfaces;

public interface IDatabaseBackupService
{
    Task<byte[]> CreateBackupAsync();
    Task<byte[]> CreateSchemaBackupAsync();
    Task<byte[]> CreateDataBackupAsync();
}
