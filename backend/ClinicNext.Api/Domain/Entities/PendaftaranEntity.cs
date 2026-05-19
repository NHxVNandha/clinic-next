namespace ClinicNext.Api.Domain.Entities;

public class PendaftaranEntity
{
    public long Id { get; set; }

    public string IdRegistrasi { get; set; } = string.Empty;

    public long IdPasien { get; set; }

    public string? KdDokter { get; set; }

    public int? InputBy { get; set; }

    public string? Tanggal { get; set; }

    public string? Status { get; set; }

    public DateTime? DeletedAt { get; set; }
}
