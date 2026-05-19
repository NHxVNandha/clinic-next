namespace ClinicNext.Api.Domain.Entities;

public class PembayaranEntity
{
    public long Id { get; set; }

    public string IdRegistrasi { get; set; } = string.Empty;

    public string IdPasien { get; set; } = string.Empty;

    public string? KdDokter { get; set; }

    public string? NoInvoice { get; set; }

    public decimal? Total { get; set; }

    public decimal? BAdmin { get; set; }

    public decimal? BTambahan { get; set; }

    public decimal? BOngkir { get; set; }

    public decimal? Diskon { get; set; }

    public decimal? Grandtotal { get; set; }

    public decimal? JumlahBayar { get; set; }

    public decimal? Sisa { get; set; }

    public string? Status { get; set; }

    public string? TglBayar { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
