namespace ClinicNext.Api.Domain.Entities;

public class StandartFieldGroupEntity
{
    public long Id { get; set; }

    public string? Nama { get; set; }

    public string? Tanggal { get; set; }

    public int? IsAktif { get; set; }

    public string? Keterangan { get; set; }

    public DateTime? DeletedAt { get; set; }
}
