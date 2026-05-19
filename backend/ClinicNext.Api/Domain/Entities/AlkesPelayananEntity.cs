namespace ClinicNext.Api.Domain.Entities;

public class AlkesPelayananEntity
{
    public long Id { get; set; }

    public string IdAlkes { get; set; } = string.Empty;

    public string IdRegistrasi { get; set; } = string.Empty;

    public string IdPasien { get; set; } = string.Empty;

    public string? KdDokter { get; set; }

    public string? Tanggal { get; set; }

    public decimal? Total { get; set; }

    public string? Status { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
