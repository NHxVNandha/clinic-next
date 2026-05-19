namespace ClinicNext.Api.Domain.Entities;

public class PengeluaranDetailEntity
{
    public long Id { get; set; }

    public long PengeluaranId { get; set; }

    public string? Nama { get; set; }

    public int Jumlah { get; set; }

    public decimal Biaya { get; set; }

    public decimal SubTotal { get; set; }

    public DateTime? DeletedAt { get; set; }
}
