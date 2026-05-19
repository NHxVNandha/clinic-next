namespace ClinicNext.Api.Domain.Entities;

public class KodeWilayahEntity
{
    public long Id { get; set; }

    public string? KodeWilayah { get; set; }

    public string? NamaWilayah { get; set; }

    public string? KodeLama { get; set; }

    public string? KodeBps { get; set; }

    public string? Parent { get; set; }

    public string? State { get; set; }
}
