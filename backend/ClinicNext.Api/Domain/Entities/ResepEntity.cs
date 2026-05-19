namespace ClinicNext.Api.Domain.Entities;

public class ResepEntity
{
    public long Id { get; set; }

    public string IdResep { get; set; } = string.Empty;

    public string IdRegistrasi { get; set; } = string.Empty;

    public string IdPasien { get; set; } = string.Empty;

    public string? KdDokter { get; set; }

    public string? Racikan { get; set; }

    public string? Tanggal { get; set; }

    public decimal? Total { get; set; }

    public string? Status { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
