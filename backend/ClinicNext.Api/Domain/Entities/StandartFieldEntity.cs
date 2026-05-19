namespace ClinicNext.Api.Domain.Entities;

public class StandartFieldEntity
{
    public long Id { get; set; }

    public long? IdFieldGroup { get; set; }

    public string? KodeField { get; set; }

    public string? DescField { get; set; }

    public string? File { get; set; }

    public int? IsAktif { get; set; }

    public string? Keterangan { get; set; }

    public DateTime? DeletedAt { get; set; }
}
