using ClinicNext.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicNext.Api.Data;

public class ClinicDbContext : DbContext
{
    public ClinicDbContext(DbContextOptions<ClinicDbContext> options) : base(options)
    {
    }

    public DbSet<UserEntity> Users => Set<UserEntity>();

    public DbSet<PasienEntity> Pasien => Set<PasienEntity>();

    public DbSet<DokterEntity> Dokter => Set<DokterEntity>();

    public DbSet<JasaEntity> Jasa => Set<JasaEntity>();

    public DbSet<DiagnosaEntity> Diagnosa => Set<DiagnosaEntity>();

    public DbSet<RefreshTokenEntity> RefreshTokens => Set<RefreshTokenEntity>();

    public DbSet<SettingEntity> Setting => Set<SettingEntity>();

    public DbSet<PendaftaranEntity> Pendaftaran => Set<PendaftaranEntity>();

    public DbSet<TindakanEntity> Tindakan => Set<TindakanEntity>();

    public DbSet<TindakanDetailEntity> TindakanDetail => Set<TindakanDetailEntity>();

    public DbSet<PembayaranEntity> Pembayaran => Set<PembayaranEntity>();

    public DbSet<ResepEntity> Resep => Set<ResepEntity>();

    public DbSet<ResepDetailEntity> ResepDetail => Set<ResepDetailEntity>();

    public DbSet<AlkesPelayananEntity> AlkesPelayanan => Set<AlkesPelayananEntity>();

    public DbSet<AlkesDetailEntity> AlkesDetail => Set<AlkesDetailEntity>();

    public DbSet<LaboratoriumEntity> Laboratorium => Set<LaboratoriumEntity>();

    public DbSet<LaboratoriumDetailEntity> LaboratoriumDetail => Set<LaboratoriumDetailEntity>();

    public DbSet<RadiologiEntity> Radiologi => Set<RadiologiEntity>();

    public DbSet<RadiologiDetailEntity> RadiologiDetail => Set<RadiologiDetailEntity>();

    public DbSet<KodeWilayahEntity> KodeWilayah => Set<KodeWilayahEntity>();

    public DbSet<KodePosEntity> KodePos => Set<KodePosEntity>();

    public DbSet<StandartFieldGroupEntity> StandartFieldGroup => Set<StandartFieldGroupEntity>();

    public DbSet<StandartFieldEntity> StandartField => Set<StandartFieldEntity>();

    public DbSet<PembayaranDetailEntity> PembayaranDetail => Set<PembayaranDetailEntity>();

    public DbSet<PengeluaranEntity> Pengeluaran => Set<PengeluaranEntity>();

    public DbSet<PengeluaranDetailEntity> PengeluaranDetail => Set<PengeluaranDetailEntity>();

    public DbSet<RekamMedisHistoryEntity> RekamMedisHistory => Set<RekamMedisHistoryEntity>();

    public DbSet<BlankRekamMedisEntity> BlankRekamMedis => Set<BlankRekamMedisEntity>();

    public DbSet<SuratKeteranganSakitEntity> SuratKeteranganSakit => Set<SuratKeteranganSakitEntity>();
    public DbSet<SuratKeteranganSehatEntity> SuratKeteranganSehat => Set<SuratKeteranganSehatEntity>();
    public DbSet<SuratKonsultasiEntity> SuratKonsultasi => Set<SuratKonsultasiEntity>();
    public DbSet<SuratJawabanKonsultasiEntity> SuratJawabanKonsultasi => Set<SuratJawabanKonsultasiEntity>();
    public DbSet<SuratPermintaanDirawatEntity> SuratPermintaanDirawat => Set<SuratPermintaanDirawatEntity>();
    public DbSet<SuratPermintaanTindakanEntity> SuratPermintaanTindakan => Set<SuratPermintaanTindakanEntity>();
    public DbSet<SuratPermintaanODCEntity> SuratPermintaanODC => Set<SuratPermintaanODCEntity>();
    public DbSet<SuratKontrolEntity> SuratKontrol => Set<SuratKontrolEntity>();
    public DbSet<SuratPersetujuanTindakanKedokteranEntity> SuratPersetujuanTindakanKedokteran => Set<SuratPersetujuanTindakanKedokteranEntity>();
    public DbSet<SuratPenolakanTindakanKedokteranEntity> SuratPenolakanTindakanKedokteran => Set<SuratPenolakanTindakanKedokteranEntity>();
    public DbSet<SuratRingkasanPasienPulangEntity> SuratRingkasanPasienPulang => Set<SuratRingkasanPasienPulangEntity>();
    public DbSet<AsesmenMedisPasienRawatJalanEntity> AsesmenMedisPasienRawatJalan => Set<AsesmenMedisPasienRawatJalanEntity>();
    public DbSet<AsesmenMedisPasienSpesialisGigiRawatJalanEntity> AsesmenMedisPasienSpesialisGigiRawatJalan => Set<AsesmenMedisPasienSpesialisGigiRawatJalanEntity>();
    public DbSet<CatatanPerkembanganPasienTerintegrasiEntity> CatatanPerkembanganPasienTerintegrasi => Set<CatatanPerkembanganPasienTerintegrasiEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasColumnName("name");
            entity.Property(x => x.Email).HasColumnName("email");
            entity.Property(x => x.Password).HasColumnName("password");
            entity.Property(x => x.RoleId).HasColumnName("role_id");
            entity.Property(x => x.RememberToken).HasColumnName("remember_token");
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<PasienEntity>(entity =>
        {
            entity.ToTable("tm_pasien");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.IdIhs).HasColumnName("id_ihs");
            entity.Property(x => x.Nik).HasColumnName("nik");
            entity.Property(x => x.Npwp).HasColumnName("npwp");
            entity.Property(x => x.Nama).HasColumnName("nama");
            entity.Property(x => x.Day).HasColumnName("day");
            entity.Property(x => x.Month).HasColumnName("month");
            entity.Property(x => x.Year).HasColumnName("year");
            entity.Property(x => x.JenisKelamin).HasColumnName("jenis_kelamin");
            entity.Property(x => x.Alamat).HasColumnName("alamat");
            entity.Property(x => x.Rt).HasColumnName("rt");
            entity.Property(x => x.Rw).HasColumnName("rw");
            entity.Property(x => x.Provinsi).HasColumnName("provinsi");
            entity.Property(x => x.Kota).HasColumnName("kota");
            entity.Property(x => x.Kecamatan).HasColumnName("kecamatan");
            entity.Property(x => x.KodePos).HasColumnName("kode_pos");
            entity.Property(x => x.Kelurahan).HasColumnName("kelurahan");
            entity.Property(x => x.Agama).HasColumnName("agama");
            entity.Property(x => x.StatusKawin).HasColumnName("status_kawin");
            entity.Property(x => x.Pekerjaan).HasColumnName("pekerjaan");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.NoHp).HasColumnName("no_hp");
            entity.Property(x => x.Email).HasColumnName("email");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<DokterEntity>(entity =>
        {
            entity.ToTable("tm_dokter");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
            entity.Property(x => x.NamaDokter).HasColumnName("nm_dokter");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<JasaEntity>(entity =>
        {
            entity.ToTable("tm_jasa");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Icd9).HasColumnName("icd9");
            entity.Property(x => x.NamaJasa).HasColumnName("nama_jasa");
            entity.Property(x => x.Keterangan).HasColumnName("keterangan");
            entity.Property(x => x.Harga).HasColumnName("harga");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<DiagnosaEntity>(entity =>
        {
            entity.ToTable("tm_diagnosa");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.KodeDiagnosa).HasColumnName("kode_diagnosa");
            entity.Property(x => x.KodeSnomed).HasColumnName("kode_snomed");
            entity.Property(x => x.NamaDiagnosa).HasColumnName("nama_diagnosa");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<RefreshTokenEntity>(entity =>
        {
            entity.ToTable("tt_auth_refresh_token");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.UserId).HasColumnName("user_id");
            entity.Property(x => x.TokenHash).HasColumnName("token_hash");
            entity.Property(x => x.ExpiresAt).HasColumnName("expires_at");
            entity.Property(x => x.RevokedAt).HasColumnName("revoked_at");
            entity.Property(x => x.DeviceName).HasColumnName("device_name");
            entity.Property(x => x.UserAgent).HasColumnName("user_agent");
            entity.Property(x => x.IpAddress).HasColumnName("ip_address");
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<SettingEntity>(entity =>
        {
            entity.ToTable("tm_setting");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Jenis).HasColumnName("jenis");
            entity.Property(x => x.Nama).HasColumnName("nama");
            entity.Property(x => x.Alamat).HasColumnName("alamat");
            entity.Property(x => x.Email).HasColumnName("email");
            entity.Property(x => x.NoHp).HasColumnName("no_hp");
            entity.Property(x => x.Phone).HasColumnName("phone");
            entity.Property(x => x.Logo).HasColumnName("logo");
            entity.Property(x => x.LogoSidebar).HasColumnName("logo_sidebar");
            entity.Property(x => x.TitleSidebar).HasColumnName("title_sidebar");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.Keterangan).HasColumnName("keterangan");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<PendaftaranEntity>(entity =>
        {
            entity.ToTable("tt_pendaftaran");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<TindakanEntity>(entity =>
        {
            entity.ToTable("tt_tindakan");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdTransaksi).HasColumnName("id_transaksi");
            entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<TindakanDetailEntity>(entity =>
        {
            entity.ToTable("tt_tindakan_detail");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdTindakan).HasColumnName("id_tindakan");
            entity.Property(x => x.IdJasa).HasColumnName("id_jasa");
            entity.Property(x => x.Harga).HasColumnName("harga");
            entity.Property(x => x.Jumlah).HasColumnName("jumlah");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<PembayaranEntity>(entity =>
        {
            entity.ToTable("tt_pembayaran");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
            entity.Property(x => x.NoInvoice).HasColumnName("no_invoice");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.BAdmin).HasColumnName("b_admin");
            entity.Property(x => x.BTambahan).HasColumnName("b_tambahan");
            entity.Property(x => x.BOngkir).HasColumnName("b_ongkir");
            entity.Property(x => x.Diskon).HasColumnName("diskon");
            entity.Property(x => x.Grandtotal).HasColumnName("grandtotal");
            entity.Property(x => x.JumlahBayar).HasColumnName("jumlah_bayar");
            entity.Property(x => x.Sisa).HasColumnName("sisa");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.TglBayar).HasColumnName("tgl_bayar");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<ResepEntity>(entity =>
        {
            entity.ToTable("tt_resep");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdResep).HasColumnName("id_resep");
            entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
            entity.Property(x => x.Racikan).HasColumnName("racikan");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<ResepDetailEntity>(entity =>
        {
            entity.ToTable("tt_resep_detail");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdResep).HasColumnName("id_resep");
            entity.Property(x => x.IdBarang).HasColumnName("id_barang");
            entity.Property(x => x.NamaObat).HasColumnName("nama_obat");
            entity.Property(x => x.AturanPakai).HasColumnName("aturan_pakai");
            entity.Property(x => x.Jumlah).HasColumnName("jumlah");
            entity.Property(x => x.Harga).HasColumnName("harga");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<AlkesPelayananEntity>(entity =>
        {
            entity.ToTable("tt_alkes");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdAlkes).HasColumnName("id_alkes");
            entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<AlkesDetailEntity>(entity =>
        {
            entity.ToTable("tt_alkes_detail");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdAlkes).HasColumnName("id_alkes");
            entity.Property(x => x.KodeBarang).HasColumnName("kode_barang");
            entity.Property(x => x.NamaBarang).HasColumnName("nama_barang");
            entity.Property(x => x.Jumlah).HasColumnName("jumlah");
            entity.Property(x => x.Harga).HasColumnName("harga");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<LaboratoriumEntity>(entity =>
        {
            entity.ToTable("tt_laboratorium");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdLaboratorium).HasColumnName("id_laboratorium");
            entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<LaboratoriumDetailEntity>(entity =>
        {
            entity.ToTable("tt_laboratorium_detail");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdLaboratorium).HasColumnName("id_laboratorium");
            entity.Property(x => x.KodePemeriksaan).HasColumnName("kode_pemeriksaan");
            entity.Property(x => x.NamaPemeriksaan).HasColumnName("nama_pemeriksaan");
            entity.Property(x => x.Hasil).HasColumnName("hasil");
            entity.Property(x => x.Jumlah).HasColumnName("jumlah");
            entity.Property(x => x.Harga).HasColumnName("harga");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<RadiologiEntity>(entity =>
        {
            entity.ToTable("tt_radiologi");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdRadiologi).HasColumnName("id_radiologi");
            entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<RadiologiDetailEntity>(entity =>
        {
            entity.ToTable("tt_radiologi_detail");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdRadiologi).HasColumnName("id_radiologi");
            entity.Property(x => x.KodePemeriksaan).HasColumnName("kode_pemeriksaan");
            entity.Property(x => x.NamaPemeriksaan).HasColumnName("nama_pemeriksaan");
            entity.Property(x => x.Hasil).HasColumnName("hasil");
            entity.Property(x => x.Jumlah).HasColumnName("jumlah");
            entity.Property(x => x.Harga).HasColumnName("harga");
            entity.Property(x => x.Total).HasColumnName("total");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<KodeWilayahEntity>(entity =>
        {
            entity.ToTable("tm_kode_wilayah");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.KodeWilayah).HasColumnName("kode_wilayah");
            entity.Property(x => x.NamaWilayah).HasColumnName("nama_wilayah");
            entity.Property(x => x.KodeLama).HasColumnName("kode_lama");
            entity.Property(x => x.KodeBps).HasColumnName("kode_bps");
            entity.Property(x => x.Parent).HasColumnName("parent");
            entity.Property(x => x.State).HasColumnName("state");
        });

        modelBuilder.Entity<KodePosEntity>(entity =>
        {
            entity.ToTable("tm_kode_pos");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.KodePos).HasColumnName("kode_pos");
            entity.Property(x => x.Kelurahan).HasColumnName("kelurahan");
            entity.Property(x => x.Kecamatan).HasColumnName("kecamatan");
            entity.Property(x => x.Kabupaten).HasColumnName("kabupaten");
            entity.Property(x => x.Provinsi).HasColumnName("provinsi");
        });

        modelBuilder.Entity<StandartFieldGroupEntity>(entity =>
        {
            entity.ToTable("tm_standartfield_group");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Nama).HasColumnName("nama");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.IsAktif).HasColumnName("is_aktif");
            entity.Property(x => x.Keterangan).HasColumnName("keterangan");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<StandartFieldEntity>(entity =>
        {
            entity.ToTable("tm_standartfield");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdFieldGroup).HasColumnName("id_fieldgroup");
            entity.Property(x => x.KodeField).HasColumnName("kode_field");
            entity.Property(x => x.DescField).HasColumnName("desc_field");
            entity.Property(x => x.File).HasColumnName("file");
            entity.Property(x => x.IsAktif).HasColumnName("is_aktif");
            entity.Property(x => x.Keterangan).HasColumnName("keterangan");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<PembayaranDetailEntity>(entity =>
        {
            entity.ToTable("tt_pembayaran_detail");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdPembayaran).HasColumnName("id_pembayaran");
            entity.Property(x => x.KodeItem).HasColumnName("kode_item");
            entity.Property(x => x.Item).HasColumnName("item");
            entity.Property(x => x.Nominal).HasColumnName("nominal");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<PengeluaranEntity>(entity =>
        {
            entity.ToTable("tt_pengeluaran");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.KodePengeluaran).HasColumnName("kode_pengeluaran");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.GrandTotal).HasColumnName("grand_total");
            entity.Property(x => x.File).HasColumnName("file");
            entity.Property(x => x.Keterangan).HasColumnName("keterangan");
            entity.Property(x => x.IsAktif).HasColumnName("is_aktif");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<PengeluaranDetailEntity>(entity =>
        {
            entity.ToTable("tt_pengeluaran_detail");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.PengeluaranId).HasColumnName("pengeluaran_id");
            entity.Property(x => x.Nama).HasColumnName("nama");
            entity.Property(x => x.Jumlah).HasColumnName("jumlah");
            entity.Property(x => x.Biaya).HasColumnName("biaya");
            entity.Property(x => x.SubTotal).HasColumnName("sub_total");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<RekamMedisHistoryEntity>(entity =>
        {
            entity.ToTable("tt_rekam_medis_history");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.IdRm).HasColumnName("id_rm");
            entity.Property(x => x.KodeRm).HasColumnName("kode_rm");
            entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
            entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
            entity.Property(x => x.JudulRm).HasColumnName("judul_rm");
            entity.Property(x => x.Url).HasColumnName("url");
            entity.Property(x => x.Tanggal).HasColumnName("tanggal");
            entity.Property(x => x.Jam).HasColumnName("jam");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        modelBuilder.Entity<BlankRekamMedisEntity>(entity =>
        {
            entity.ToTable("mr_blank_rekam_medis");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.RekamMedis).HasColumnName("rekam_medis");
            entity.Property(x => x.KodeRm).HasColumnName("kode_rm");
            entity.Property(x => x.InputBy).HasColumnName("input_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        });

        MapMrSuratBase(modelBuilder.Entity<SuratKeteranganSakitEntity>(), "mr_surat_keterangan_sakit");
        MapMrSuratBase(modelBuilder.Entity<SuratKeteranganSehatEntity>(), "mr_surat_keterangan_sehat");
        MapMrSuratBase(modelBuilder.Entity<SuratKonsultasiEntity>(), "mr_surat_konsultasi");
        MapMrSuratBase(modelBuilder.Entity<SuratJawabanKonsultasiEntity>(), "mr_surat_jawaban_konsultasi");
        MapMrSuratBase(modelBuilder.Entity<SuratPermintaanDirawatEntity>(), "mr_surat_permintaan_dirawat");
        MapMrSuratBase(modelBuilder.Entity<SuratPermintaanTindakanEntity>(), "mr_surat_permintaan_tindakan");
        MapMrSuratBase(modelBuilder.Entity<SuratPermintaanODCEntity>(), "mr_surat_permintaan_odc");
        MapMrSuratBase(modelBuilder.Entity<SuratKontrolEntity>(), "mr_surat_kontrol");
        MapMrSuratBase(modelBuilder.Entity<SuratPersetujuanTindakanKedokteranEntity>(), "mr_surat_persetujuan_tindakan_kedokteran");
        MapMrSuratBase(modelBuilder.Entity<SuratPenolakanTindakanKedokteranEntity>(), "mr_surat_penolakan_tindakan_kedokteran");
        MapMrSuratBase(modelBuilder.Entity<SuratRingkasanPasienPulangEntity>(), "mr_surat_ringkasan_pasien_pulang");
        MapMrSuratBase(modelBuilder.Entity<AsesmenMedisPasienRawatJalanEntity>(), "mr_asesmen_medis_pasien_rawat_jalan");
        MapMrSuratBase(modelBuilder.Entity<AsesmenMedisPasienSpesialisGigiRawatJalanEntity>(), "mr_asesmen_medis_pasien_spesialis_gigi_rawat_jalan");
        MapMrSuratBase(modelBuilder.Entity<CatatanPerkembanganPasienTerintegrasiEntity>(), "mr_catatan_perkembangan_pasien_terintegrasi");
    }

    private static void MapMrSuratBase<T>(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<T> entity, string tableName)
        where T : MrSuratBaseEntity
    {
        entity.ToTable(tableName);
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Id).HasColumnName("id");
        entity.Property(x => x.IdRegistrasi).HasColumnName("id_registrasi");
        entity.Property(x => x.IdPasien).HasColumnName("id_pasien");
        entity.Property(x => x.KdDokter).HasColumnName("kd_dokter");
        entity.Property(x => x.KodeRm).HasColumnName("kode_rm");
        entity.Property(x => x.InputBy).HasColumnName("input_by");
        entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
    }
}
