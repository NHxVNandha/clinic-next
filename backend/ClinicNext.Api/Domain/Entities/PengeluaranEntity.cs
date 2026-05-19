namespace ClinicNext.Api.Domain.Entities;

public class PengeluaranEntity
{
    public long Id { get; set; }

    public string? KodePengeluaran { get; set; }

    public string? Tanggal { get; set; }

    public decimal? GrandTotal { get; set; }

    public string? File { get; set; }

    public string? Keterangan { get; set; }

    public int? IsAktif { get; set; }

    public string? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
