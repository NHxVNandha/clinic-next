using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ClinicNext.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "mr_asesmen_medis_pasien_rawat_jalan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_asesmen_medis_pasien_rawat_jalan", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_asesmen_medis_pasien_spesialis_gigi_rawat_jalan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_asesmen_medis_pasien_spesialis_gigi_rawat_jalan", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_blank_rekam_medis",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    rekam_medis = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_blank_rekam_medis", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_catatan_perkembangan_pasien_terintegrasi",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_catatan_perkembangan_pasien_terintegrasi", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_jawaban_konsultasi",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_jawaban_konsultasi", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_keterangan_sakit",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_keterangan_sakit", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_keterangan_sehat",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_keterangan_sehat", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_konsultasi",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_konsultasi", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_kontrol",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_kontrol", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_penolakan_tindakan_kedokteran",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_penolakan_tindakan_kedokteran", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_permintaan_dirawat",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_permintaan_dirawat", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_permintaan_odc",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_permintaan_odc", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_permintaan_tindakan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_permintaan_tindakan", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_persetujuan_tindakan_kedokteran",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_persetujuan_tindakan_kedokteran", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mr_surat_ringkasan_pasien_pulang",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mr_surat_ringkasan_pasien_pulang", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_diagnosa",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kode_diagnosa = table.Column<string>(type: "text", nullable: true),
                    kode_snomed = table.Column<string>(type: "text", nullable: true),
                    nama_diagnosa = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_diagnosa", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_dokter",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kd_dokter = table.Column<string>(type: "text", nullable: false),
                    nm_dokter = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_dokter", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_jasa",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    icd9 = table.Column<string>(type: "text", nullable: true),
                    nama_jasa = table.Column<string>(type: "text", nullable: true),
                    keterangan = table.Column<string>(type: "text", nullable: true),
                    harga = table.Column<decimal>(type: "numeric", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_jasa", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_kode_pos",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kode_pos = table.Column<string>(type: "text", nullable: true),
                    kelurahan = table.Column<string>(type: "text", nullable: true),
                    kecamatan = table.Column<string>(type: "text", nullable: true),
                    kabupaten = table.Column<string>(type: "text", nullable: true),
                    provinsi = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_kode_pos", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_kode_wilayah",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kode_wilayah = table.Column<string>(type: "text", nullable: true),
                    nama_wilayah = table.Column<string>(type: "text", nullable: true),
                    kode_lama = table.Column<string>(type: "text", nullable: true),
                    kode_bps = table.Column<string>(type: "text", nullable: true),
                    parent = table.Column<string>(type: "text", nullable: true),
                    state = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_kode_wilayah", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_pasien",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_pasien = table.Column<string>(type: "text", nullable: false),
                    nik = table.Column<string>(type: "text", nullable: false),
                    nama = table.Column<string>(type: "text", nullable: false),
                    id_ihs = table.Column<string>(type: "text", nullable: true),
                    npwp = table.Column<string>(type: "text", nullable: true),
                    day = table.Column<string>(type: "text", nullable: true),
                    month = table.Column<string>(type: "text", nullable: true),
                    year = table.Column<string>(type: "text", nullable: true),
                    jenis_kelamin = table.Column<string>(type: "text", nullable: true),
                    alamat = table.Column<string>(type: "text", nullable: true),
                    rt = table.Column<string>(type: "text", nullable: true),
                    rw = table.Column<string>(type: "text", nullable: true),
                    provinsi = table.Column<string>(type: "text", nullable: true),
                    kota = table.Column<string>(type: "text", nullable: true),
                    kecamatan = table.Column<string>(type: "text", nullable: true),
                    kode_pos = table.Column<string>(type: "text", nullable: true),
                    kelurahan = table.Column<string>(type: "text", nullable: true),
                    agama = table.Column<string>(type: "text", nullable: true),
                    status_kawin = table.Column<string>(type: "text", nullable: true),
                    pekerjaan = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    no_hp = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_pasien", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_setting",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jenis = table.Column<string>(type: "text", nullable: true),
                    nama = table.Column<string>(type: "text", nullable: true),
                    alamat = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    no_hp = table.Column<string>(type: "text", nullable: true),
                    phone = table.Column<string>(type: "text", nullable: true),
                    logo = table.Column<string>(type: "text", nullable: true),
                    logo_sidebar = table.Column<string>(type: "text", nullable: true),
                    title_sidebar = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<string>(type: "text", nullable: true),
                    keterangan = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_setting", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_standartfield",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_fieldgroup = table.Column<long>(type: "bigint", nullable: true),
                    kode_field = table.Column<string>(type: "text", nullable: true),
                    desc_field = table.Column<string>(type: "text", nullable: true),
                    file = table.Column<string>(type: "text", nullable: true),
                    is_aktif = table.Column<int>(type: "integer", nullable: true),
                    keterangan = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_standartfield", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tm_standartfield_group",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nama = table.Column<string>(type: "text", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    is_aktif = table.Column<int>(type: "integer", nullable: true),
                    keterangan = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tm_standartfield_group", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_alkes",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_alkes = table.Column<string>(type: "text", nullable: false),
                    id_registrasi = table.Column<string>(type: "text", nullable: false),
                    id_pasien = table.Column<string>(type: "text", nullable: false),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    total = table.Column<decimal>(type: "numeric", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_alkes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_alkes_detail",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_alkes = table.Column<long>(type: "bigint", nullable: false),
                    kode_barang = table.Column<string>(type: "text", nullable: true),
                    nama_barang = table.Column<string>(type: "text", nullable: true),
                    jumlah = table.Column<int>(type: "integer", nullable: false),
                    harga = table.Column<decimal>(type: "numeric", nullable: false),
                    total = table.Column<decimal>(type: "numeric", nullable: false),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_alkes_detail", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_auth_refresh_token",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    device_name = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_auth_refresh_token", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_laboratorium",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_laboratorium = table.Column<string>(type: "text", nullable: false),
                    id_registrasi = table.Column<string>(type: "text", nullable: false),
                    id_pasien = table.Column<string>(type: "text", nullable: false),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    total = table.Column<decimal>(type: "numeric", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_laboratorium", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_laboratorium_detail",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_laboratorium = table.Column<long>(type: "bigint", nullable: false),
                    kode_pemeriksaan = table.Column<string>(type: "text", nullable: true),
                    nama_pemeriksaan = table.Column<string>(type: "text", nullable: true),
                    hasil = table.Column<string>(type: "text", nullable: true),
                    jumlah = table.Column<int>(type: "integer", nullable: false),
                    harga = table.Column<decimal>(type: "numeric", nullable: false),
                    total = table.Column<decimal>(type: "numeric", nullable: false),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_laboratorium_detail", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_pembayaran",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: false),
                    id_pasien = table.Column<string>(type: "text", nullable: false),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    no_invoice = table.Column<string>(type: "text", nullable: true),
                    total = table.Column<decimal>(type: "numeric", nullable: true),
                    b_admin = table.Column<decimal>(type: "numeric", nullable: true),
                    b_tambahan = table.Column<decimal>(type: "numeric", nullable: true),
                    b_ongkir = table.Column<decimal>(type: "numeric", nullable: true),
                    diskon = table.Column<decimal>(type: "numeric", nullable: true),
                    grandtotal = table.Column<decimal>(type: "numeric", nullable: true),
                    jumlah_bayar = table.Column<decimal>(type: "numeric", nullable: true),
                    sisa = table.Column<decimal>(type: "numeric", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    tgl_bayar = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_pembayaran", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_pembayaran_detail",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_pembayaran = table.Column<long>(type: "bigint", nullable: false),
                    kode_item = table.Column<string>(type: "text", nullable: true),
                    item = table.Column<string>(type: "text", nullable: true),
                    nominal = table.Column<decimal>(type: "numeric", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_pembayaran_detail", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_pendaftaran",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_registrasi = table.Column<string>(type: "text", nullable: false),
                    id_pasien = table.Column<long>(type: "bigint", nullable: false),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_pendaftaran", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_pengeluaran",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kode_pengeluaran = table.Column<string>(type: "text", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    grand_total = table.Column<decimal>(type: "numeric", nullable: true),
                    file = table.Column<string>(type: "text", nullable: true),
                    keterangan = table.Column<string>(type: "text", nullable: true),
                    is_aktif = table.Column<int>(type: "integer", nullable: true),
                    input_by = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_pengeluaran", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_pengeluaran_detail",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pengeluaran_id = table.Column<long>(type: "bigint", nullable: false),
                    nama = table.Column<string>(type: "text", nullable: true),
                    jumlah = table.Column<int>(type: "integer", nullable: false),
                    biaya = table.Column<decimal>(type: "numeric", nullable: false),
                    sub_total = table.Column<decimal>(type: "numeric", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_pengeluaran_detail", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_radiologi",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_radiologi = table.Column<string>(type: "text", nullable: false),
                    id_registrasi = table.Column<string>(type: "text", nullable: false),
                    id_pasien = table.Column<string>(type: "text", nullable: false),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    total = table.Column<decimal>(type: "numeric", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_radiologi", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_radiologi_detail",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_radiologi = table.Column<long>(type: "bigint", nullable: false),
                    kode_pemeriksaan = table.Column<string>(type: "text", nullable: true),
                    nama_pemeriksaan = table.Column<string>(type: "text", nullable: true),
                    hasil = table.Column<string>(type: "text", nullable: true),
                    jumlah = table.Column<int>(type: "integer", nullable: false),
                    harga = table.Column<decimal>(type: "numeric", nullable: false),
                    total = table.Column<decimal>(type: "numeric", nullable: false),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_radiologi_detail", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_rekam_medis_history",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_rm = table.Column<long>(type: "bigint", nullable: true),
                    kode_rm = table.Column<string>(type: "text", nullable: true),
                    id_pasien = table.Column<string>(type: "text", nullable: true),
                    id_registrasi = table.Column<string>(type: "text", nullable: true),
                    judul_rm = table.Column<string>(type: "text", nullable: true),
                    url = table.Column<string>(type: "text", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    jam = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_rekam_medis_history", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_resep",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_resep = table.Column<string>(type: "text", nullable: false),
                    id_registrasi = table.Column<string>(type: "text", nullable: false),
                    id_pasien = table.Column<string>(type: "text", nullable: false),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    racikan = table.Column<string>(type: "text", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    total = table.Column<decimal>(type: "numeric", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_resep", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_resep_detail",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_resep = table.Column<long>(type: "bigint", nullable: false),
                    id_barang = table.Column<string>(type: "text", nullable: true),
                    nama_obat = table.Column<string>(type: "text", nullable: true),
                    aturan_pakai = table.Column<string>(type: "text", nullable: true),
                    jumlah = table.Column<int>(type: "integer", nullable: false),
                    harga = table.Column<decimal>(type: "numeric", nullable: false),
                    total = table.Column<decimal>(type: "numeric", nullable: false),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_resep_detail", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_tindakan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_transaksi = table.Column<string>(type: "text", nullable: false),
                    id_registrasi = table.Column<string>(type: "text", nullable: false),
                    id_pasien = table.Column<string>(type: "text", nullable: false),
                    kd_dokter = table.Column<string>(type: "text", nullable: true),
                    tanggal = table.Column<string>(type: "text", nullable: true),
                    total = table.Column<decimal>(type: "numeric", nullable: true),
                    status = table.Column<string>(type: "text", nullable: true),
                    input_by = table.Column<int>(type: "integer", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_tindakan", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tt_tindakan_detail",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_tindakan = table.Column<long>(type: "bigint", nullable: false),
                    id_jasa = table.Column<long>(type: "bigint", nullable: false),
                    harga = table.Column<decimal>(type: "numeric", nullable: false),
                    jumlah = table.Column<int>(type: "integer", nullable: false),
                    total = table.Column<decimal>(type: "numeric", nullable: false),
                    status = table.Column<string>(type: "text", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tt_tindakan_detail", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password = table.Column<string>(type: "text", nullable: false),
                    role_id = table.Column<int>(type: "integer", nullable: true),
                    remember_token = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "mr_asesmen_medis_pasien_rawat_jalan");

            migrationBuilder.DropTable(
                name: "mr_asesmen_medis_pasien_spesialis_gigi_rawat_jalan");

            migrationBuilder.DropTable(
                name: "mr_blank_rekam_medis");

            migrationBuilder.DropTable(
                name: "mr_catatan_perkembangan_pasien_terintegrasi");

            migrationBuilder.DropTable(
                name: "mr_surat_jawaban_konsultasi");

            migrationBuilder.DropTable(
                name: "mr_surat_keterangan_sakit");

            migrationBuilder.DropTable(
                name: "mr_surat_keterangan_sehat");

            migrationBuilder.DropTable(
                name: "mr_surat_konsultasi");

            migrationBuilder.DropTable(
                name: "mr_surat_kontrol");

            migrationBuilder.DropTable(
                name: "mr_surat_penolakan_tindakan_kedokteran");

            migrationBuilder.DropTable(
                name: "mr_surat_permintaan_dirawat");

            migrationBuilder.DropTable(
                name: "mr_surat_permintaan_odc");

            migrationBuilder.DropTable(
                name: "mr_surat_permintaan_tindakan");

            migrationBuilder.DropTable(
                name: "mr_surat_persetujuan_tindakan_kedokteran");

            migrationBuilder.DropTable(
                name: "mr_surat_ringkasan_pasien_pulang");

            migrationBuilder.DropTable(
                name: "tm_diagnosa");

            migrationBuilder.DropTable(
                name: "tm_dokter");

            migrationBuilder.DropTable(
                name: "tm_jasa");

            migrationBuilder.DropTable(
                name: "tm_kode_pos");

            migrationBuilder.DropTable(
                name: "tm_kode_wilayah");

            migrationBuilder.DropTable(
                name: "tm_pasien");

            migrationBuilder.DropTable(
                name: "tm_setting");

            migrationBuilder.DropTable(
                name: "tm_standartfield");

            migrationBuilder.DropTable(
                name: "tm_standartfield_group");

            migrationBuilder.DropTable(
                name: "tt_alkes");

            migrationBuilder.DropTable(
                name: "tt_alkes_detail");

            migrationBuilder.DropTable(
                name: "tt_auth_refresh_token");

            migrationBuilder.DropTable(
                name: "tt_laboratorium");

            migrationBuilder.DropTable(
                name: "tt_laboratorium_detail");

            migrationBuilder.DropTable(
                name: "tt_pembayaran");

            migrationBuilder.DropTable(
                name: "tt_pembayaran_detail");

            migrationBuilder.DropTable(
                name: "tt_pendaftaran");

            migrationBuilder.DropTable(
                name: "tt_pengeluaran");

            migrationBuilder.DropTable(
                name: "tt_pengeluaran_detail");

            migrationBuilder.DropTable(
                name: "tt_radiologi");

            migrationBuilder.DropTable(
                name: "tt_radiologi_detail");

            migrationBuilder.DropTable(
                name: "tt_rekam_medis_history");

            migrationBuilder.DropTable(
                name: "tt_resep");

            migrationBuilder.DropTable(
                name: "tt_resep_detail");

            migrationBuilder.DropTable(
                name: "tt_tindakan");

            migrationBuilder.DropTable(
                name: "tt_tindakan_detail");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
