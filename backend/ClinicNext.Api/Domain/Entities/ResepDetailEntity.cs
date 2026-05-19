namespace ClinicNext.Api.Domain.Entities;

public class ResepDetailEntity
{
    public long Id { get; set; }

    public long IdResep { get; set; }

    public string? IdBarang { get; set; }

    public string? NamaObat { get; set; }

    public string? AturanPakai { get; set; }

    public int Jumlah { get; set; }

    public decimal Harga { get; set; }

    public decimal Total { get; set; }

    public string? Status { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
