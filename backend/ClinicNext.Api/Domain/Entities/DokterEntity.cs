namespace ClinicNext.Api.Domain.Entities;

public class DokterEntity
{
    public long Id { get; set; }

    public string KdDokter { get; set; } = string.Empty;

    public string? NamaDokter { get; set; }

    public DateTime? DeletedAt { get; set; }
}
