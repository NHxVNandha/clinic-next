namespace ClinicNext.Api.Domain.Entities;

public class PasienEntity
{
    public long Id { get; set; }

    public string IdPasien { get; set; } = string.Empty;

    public string Nik { get; set; } = string.Empty;

    public string Nama { get; set; } = string.Empty;

    public string? IdIhs { get; set; }

    public string? Npwp { get; set; }

    public string? Day { get; set; }

    public string? Month { get; set; }

    public string? Year { get; set; }

    public string? JenisKelamin { get; set; }

    public string? Alamat { get; set; }

    public string? Rt { get; set; }

    public string? Rw { get; set; }

    public string? Provinsi { get; set; }

    public string? Kota { get; set; }

    public string? Kecamatan { get; set; }

    public string? KodePos { get; set; }

    public string? Kelurahan { get; set; }

    public string? Agama { get; set; }

    public string? StatusKawin { get; set; }

    public string? Pekerjaan { get; set; }

    public int? InputBy { get; set; }

    public string? NoHp { get; set; }

    public string? Email { get; set; }

    public DateTime? DeletedAt { get; set; }
}
