namespace ClinicNext.Api.Domain.Entities;

public class KodePosEntity
{
    public long Id { get; set; }

    public string? KodePos { get; set; }

    public string? Kelurahan { get; set; }

    public string? Kecamatan { get; set; }

    public string? Kabupaten { get; set; }

    public string? Provinsi { get; set; }
}
