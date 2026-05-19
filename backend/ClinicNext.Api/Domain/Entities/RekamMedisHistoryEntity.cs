namespace ClinicNext.Api.Domain.Entities;

public class RekamMedisHistoryEntity
{
    public long Id { get; set; }

    public long? IdRm { get; set; }

    public string? KodeRm { get; set; }

    public string? IdPasien { get; set; }

    public string? IdRegistrasi { get; set; }

    public string? JudulRm { get; set; }

    public string? Url { get; set; }

    public string? Tanggal { get; set; }

    public string? Jam { get; set; }

    public DateTime? DeletedAt { get; set; }
}
