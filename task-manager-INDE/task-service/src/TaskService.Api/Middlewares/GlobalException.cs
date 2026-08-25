using System.Net;
using System.Text.Json;

namespace TaskService.Api.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }catch(Exception e)
        {
            _logger.LogError(e, "Ocurrio algo inesperado, sorry");
            await HandleExceptionAsync(context, e);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            statusCode = context.Response.StatusCode,
            message = "Error interno del servidor. Por favor, intente más tarde.",
            details = exception.Message
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
