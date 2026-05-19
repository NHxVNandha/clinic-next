using System.Net;
using System.Text.Json;
using ClinicNext.Api.Models.Common;

namespace ClinicNext.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception at {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex, _environment);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex, IHostEnvironment environment)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var traceId = context.TraceIdentifier;
        var message = environment.IsDevelopment() || environment.IsEnvironment("Testing")
            ? $"Internal server error: {ex.Message}"
            : "Internal server error.";
        var response = ApiResponse<object>.Fail(message, traceId);

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
