namespace ClinicNext.Api.Domain.Entities;

public class BlankRekamMedisEntity
{
    public long Id { get; set; }

    public string? RekamMedis { get; set; }

    public string? KodeRm { get; set; }

    public int? InputBy { get; set; }

    public DateTime? DeletedAt { get; set; }
}
