namespace ClinicNext.Api.Domain.Entities;

public class TindakanDetailEntity
{
    public long Id { get; set; }

    public long IdTindakan { get; set; }

    public long IdJasa { get; set; }

    public decimal Harga { get; set; }

    public int Jumlah { get; set; }

    public decimal Total { get; set; }

    public string? Status { get; set; }

    public DateTime? DeletedAt { get; set; }
}
