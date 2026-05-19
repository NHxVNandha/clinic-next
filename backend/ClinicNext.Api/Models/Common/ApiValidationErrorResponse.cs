namespace ClinicNext.Api.Models.Common;

public class ApiValidationErrorResponse
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public Dictionary<string, string[]> Errors { get; set; } = new();

    public string? TraceId { get; set; }

    public static ApiValidationErrorResponse FromErrors(Dictionary<string, string[]> errors, string? traceId)
    {
        return new ApiValidationErrorResponse
        {
            Success = false,
            Message = "Validasi gagal.",
            Errors = errors,
            TraceId = traceId
        };
    }
}
