namespace ClinicNext.Api.Domain.Entities;

public class PembayaranDetailEntity
{
    public long Id { get; set; }

    public long IdPembayaran { get; set; }

    public string? KodeItem { get; set; }

    public string? Item { get; set; }

    public decimal Nominal { get; set; }

    public DateTime? DeletedAt { get; set; }
}
