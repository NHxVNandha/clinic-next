namespace ClinicNext.Api.Domain.Entities;

public class SuratKeteranganSakitEntity : MrSuratBaseEntity { }
public class SuratKeteranganSehatEntity : MrSuratBaseEntity { }
public class SuratKonsultasiEntity : MrSuratBaseEntity { }
public class SuratJawabanKonsultasiEntity : MrSuratBaseEntity { }
public class SuratPermintaanDirawatEntity : MrSuratBaseEntity { }
public class SuratPermintaanTindakanEntity : MrSuratBaseEntity { }
public class SuratPermintaanODCEntity : MrSuratBaseEntity { }
public class SuratKontrolEntity : MrSuratBaseEntity { }
public class SuratPersetujuanTindakanKedokteranEntity : MrSuratBaseEntity { }
public class SuratPenolakanTindakanKedokteranEntity : MrSuratBaseEntity { }
public class SuratRingkasanPasienPulangEntity : MrSuratBaseEntity { }
public class AsesmenMedisPasienRawatJalanEntity : MrSuratBaseEntity { }
public class AsesmenMedisPasienSpesialisGigiRawatJalanEntity : MrSuratBaseEntity { }
public class CatatanPerkembanganPasienTerintegrasiEntity : MrSuratBaseEntity { }

public class MrSuratBaseEntity
{
    public long Id { get; set; }
    public string? IdRegistrasi { get; set; }
    public string? IdPasien { get; set; }
    public string? KdDokter { get; set; }
    public string? KodeRm { get; set; }
    public int? InputBy { get; set; }
    public DateTime? DeletedAt { get; set; }
}
