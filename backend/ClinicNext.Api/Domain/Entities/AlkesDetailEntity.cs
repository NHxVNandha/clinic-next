namespace ClinicNext.Api.Domain.Entities;

public class AlkesDetailEntity
{
    public long Id { get; set; }

    public long IdAlkes { get; set; }

    public string? KodeBarang { get; set; }

    public string? NamaBarang { get; set; }

    public int Jumlah { get; set; }

    public decimal Harga { get; set; }

    public decimal Total { get; set; }

    public string? Status { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
