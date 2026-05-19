namespace ClinicNext.Api.Domain.Entities;

public class RadiologiDetailEntity
{
    public long Id { get; set; }

    public long IdRadiologi { get; set; }

    public string? KodePemeriksaan { get; set; }

    public string? NamaPemeriksaan { get; set; }

    public string? Hasil { get; set; }

    public int Jumlah { get; set; }

    public decimal Harga { get; set; }

    public decimal Total { get; set; }

    public string? Status { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
