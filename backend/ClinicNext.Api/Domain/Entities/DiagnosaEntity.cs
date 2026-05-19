namespace ClinicNext.Api.Domain.Entities;

public class DiagnosaEntity
{
    public long Id { get; set; }

    public string? KodeDiagnosa { get; set; }

    public string? KodeSnomed { get; set; }

    public string? NamaDiagnosa { get; set; }

    public int? Status { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
