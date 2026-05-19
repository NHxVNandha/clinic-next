namespace ClinicNext.Api.Domain.Entities;

public class SettingEntity
{
    public long Id { get; set; }

    public string? Jenis { get; set; }

    public string? Nama { get; set; }

    public string? Alamat { get; set; }

    public string? Email { get; set; }

    public string? NoHp { get; set; }

    public string? Phone { get; set; }

    public string? Logo { get; set; }

    public string? LogoSidebar { get; set; }

    public string? TitleSidebar { get; set; }

    public string? InputBy { get; set; }

    public string? Keterangan { get; set; }

    public DateTime? DeletedAt { get; set; }
}
