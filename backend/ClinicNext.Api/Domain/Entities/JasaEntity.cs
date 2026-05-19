namespace ClinicNext.Api.Domain.Entities;

public class JasaEntity
{
    public long Id { get; set; }

    public string? Icd9 { get; set; }

    public string? NamaJasa { get; set; }

    public string? Keterangan { get; set; }

    public decimal? Harga { get; set; }

    public int? Status { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
