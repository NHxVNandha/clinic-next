using ClinicNext.Api.Domain.Entities;
using ClinicNext.Api.Features.Access;
using Microsoft.EntityFrameworkCore;

namespace ClinicNext.Api.Data;

public static class DatabaseBootstrapper
{
    public static async Task BootstrapDatabaseAsync(this IServiceProvider services, IConfiguration configuration, ILogger logger)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();

        if (configuration.GetValue("Database:MigrateOnStartup", false))
        {
            logger.LogInformation("Applying database migrations.");
            await dbContext.Database.MigrateAsync();
        }

        await SeedRolesAsync(dbContext);
        await SeedAdminAsync(dbContext, configuration, logger);
        await SeedMasterDataAsync(dbContext);
    }

    private static async Task SeedAdminAsync(ClinicDbContext dbContext, IConfiguration configuration, ILogger logger)
    {
        var email = configuration["SeedAdmin:Email"];
        var password = configuration["SeedAdmin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var exists = await dbContext.Users.AnyAsync(x => x.Email.ToLower() == normalizedEmail);
        if (exists)
        {
            return;
        }

        dbContext.Users.Add(new UserEntity
        {
            Name = configuration["SeedAdmin:Name"]?.Trim() is { Length: > 0 } name ? name : "Clinic Admin",
            Email = normalizedEmail,
            Password = BCrypt.Net.BCrypt.HashPassword(password),
            RoleId = configuration.GetValue<int?>("SeedAdmin:RoleId") ?? 1,
            Status = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Seeded initial admin user {Email}.", normalizedEmail);
    }

    private static async Task SeedRolesAsync(ClinicDbContext dbContext)
    {
        var now = DateTime.UtcNow;
        foreach (var role in AccessCatalog.DefaultRoleIds)
        {
            var entity = await dbContext.Roles.FirstOrDefaultAsync(x => x.Code == role.Key);
            if (entity == null)
            {
                entity = new RoleEntity
                {
                    Id = role.Value,
                    Code = role.Key,
                    Name = role.Key switch
                    {
                        "frontoffice" => "Front Office",
                        _ => char.ToUpperInvariant(role.Key[0]) + role.Key[1..]
                    },
                    IsSystem = true,
                    Status = 1,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                dbContext.Roles.Add(entity);
            }

            var permissions = AccessCatalog.DefaultRolePermissions.GetValueOrDefault(role.Key) ?? [];
            foreach (var permission in permissions)
            {
                var exists = await dbContext.RolePermissions.AnyAsync(x => x.RoleId == role.Value && x.PermissionKey == permission);
                if (!exists)
                {
                    dbContext.RolePermissions.Add(new RolePermissionEntity
                    {
                        RoleId = role.Value,
                        PermissionKey = permission,
                        Allowed = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    });
                }
            }
        }

        await dbContext.SaveChangesAsync();
        if (dbContext.Database.ProviderName?.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) == true)
        {
            await dbContext.Database.ExecuteSqlRawAsync("SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1), true)");
        }
    }

    private static async Task SeedMasterDataAsync(ClinicDbContext dbContext)
    {
        var doctors = new[]
        {
            new DokterEntity { KdDokter = "DR001", NamaDokter = "dr. Andi Pratama" },
            new DokterEntity { KdDokter = "DR002", NamaDokter = "dr. Sinta Maharani" },
            new DokterEntity { KdDokter = "DR003", NamaDokter = "dr. Budi Santoso, Sp.PD" },
            new DokterEntity { KdDokter = "DR004", NamaDokter = "dr. Maya Lestari, Sp.A" },
            new DokterEntity { KdDokter = "DR005", NamaDokter = "drg. Raka Wibowo" },
            new DokterEntity { KdDokter = "DR006", NamaDokter = "dr. Nabila Putri" },
            new DokterEntity { KdDokter = "DR007", NamaDokter = "dr. Fajar Nugroho" },
            new DokterEntity { KdDokter = "DR008", NamaDokter = "dr. Dimas Arya, Sp.KK" },
            new DokterEntity { KdDokter = "DR009", NamaDokter = "dr. Laila Rahma" },
            new DokterEntity { KdDokter = "DR010", NamaDokter = "dr. Kevin Hidayat" }
        };

        foreach (var doctor in doctors)
        {
            if (!await dbContext.Dokter.AnyAsync(x => x.KdDokter == doctor.KdDokter && x.DeletedAt == null))
            {
                dbContext.Dokter.Add(doctor);
            }
        }

        var patients = new[]
        {
            new PasienEntity { IdPasien = "PSN001", Nik = "3171010101900001", Nama = "Ahmad Fauzi", JenisKelamin = "L", Day = "01", Month = "01", Year = "1990", NoHp = "081234560001", Email = "ahmad.fauzi@example.com", Alamat = "Jl. Melati No. 1", Agama = "Islam", StatusKawin = "Kawin", Pekerjaan = "Karyawan" },
            new PasienEntity { IdPasien = "PSN002", Nik = "3171010202910002", Nama = "Siti Aminah", JenisKelamin = "P", Day = "02", Month = "02", Year = "1991", NoHp = "081234560002", Email = "siti.aminah@example.com", Alamat = "Jl. Kenanga No. 2", Agama = "Islam", StatusKawin = "Belum Kawin", Pekerjaan = "Guru" },
            new PasienEntity { IdPasien = "PSN003", Nik = "3171010303920003", Nama = "Rudi Hartono", JenisKelamin = "L", Day = "03", Month = "03", Year = "1992", NoHp = "081234560003", Email = "rudi.hartono@example.com", Alamat = "Jl. Mawar No. 3", Agama = "Kristen", StatusKawin = "Kawin", Pekerjaan = "Wiraswasta" },
            new PasienEntity { IdPasien = "PSN004", Nik = "3171010404930004", Nama = "Dewi Anggraini", JenisKelamin = "P", Day = "04", Month = "04", Year = "1993", NoHp = "081234560004", Email = "dewi.anggraini@example.com", Alamat = "Jl. Dahlia No. 4", Agama = "Islam", StatusKawin = "Kawin", Pekerjaan = "Akuntan" },
            new PasienEntity { IdPasien = "PSN005", Nik = "3171010505940005", Nama = "Teguh Saputra", JenisKelamin = "L", Day = "05", Month = "05", Year = "1994", NoHp = "081234560005", Email = "teguh.saputra@example.com", Alamat = "Jl. Anggrek No. 5", Agama = "Katolik", StatusKawin = "Belum Kawin", Pekerjaan = "Mahasiswa" },
            new PasienEntity { IdPasien = "PSN006", Nik = "3171010606950006", Nama = "Nina Kartika", JenisKelamin = "P", Day = "06", Month = "06", Year = "1995", NoHp = "081234560006", Email = "nina.kartika@example.com", Alamat = "Jl. Cempaka No. 6", Agama = "Islam", StatusKawin = "Kawin", Pekerjaan = "Perawat" },
            new PasienEntity { IdPasien = "PSN007", Nik = "3171010707960007", Nama = "Bayu Prakoso", JenisKelamin = "L", Day = "07", Month = "07", Year = "1996", NoHp = "081234560007", Email = "bayu.prakoso@example.com", Alamat = "Jl. Flamboyan No. 7", Agama = "Hindu", StatusKawin = "Belum Kawin", Pekerjaan = "Desainer" },
            new PasienEntity { IdPasien = "PSN008", Nik = "3171010808970008", Nama = "Rina Marlina", JenisKelamin = "P", Day = "08", Month = "08", Year = "1997", NoHp = "081234560008", Email = "rina.marlina@example.com", Alamat = "Jl. Teratai No. 8", Agama = "Buddha", StatusKawin = "Kawin", Pekerjaan = "Pedagang" },
            new PasienEntity { IdPasien = "PSN009", Nik = "3171010909980009", Nama = "Hendra Wijaya", JenisKelamin = "L", Day = "09", Month = "09", Year = "1998", NoHp = "081234560009", Email = "hendra.wijaya@example.com", Alamat = "Jl. Sakura No. 9", Agama = "Islam", StatusKawin = "Belum Kawin", Pekerjaan = "Programmer" },
            new PasienEntity { IdPasien = "PSN010", Nik = "3171011010990010", Nama = "Mira Oktaviani", JenisKelamin = "P", Day = "10", Month = "10", Year = "1999", NoHp = "081234560010", Email = "mira.oktaviani@example.com", Alamat = "Jl. Bougenville No. 10", Agama = "Islam", StatusKawin = "Belum Kawin", Pekerjaan = "Analis" }
        };

        foreach (var patient in patients)
        {
            if (!await dbContext.Pasien.AnyAsync(x => (x.IdPasien == patient.IdPasien || x.Nik == patient.Nik) && x.DeletedAt == null))
            {
                dbContext.Pasien.Add(patient);
            }
        }

        var services = new[]
        {
            new JasaEntity { Icd9 = "89.01", NamaJasa = "Konsultasi Dokter Umum", Keterangan = "Pemeriksaan dan konsultasi dokter umum", Harga = 75000, Status = 1 },
            new JasaEntity { Icd9 = "89.02", NamaJasa = "Konsultasi Dokter Spesialis", Keterangan = "Pemeriksaan dokter spesialis", Harga = 150000, Status = 1 },
            new JasaEntity { Icd9 = "86.59", NamaJasa = "Perawatan Luka Ringan", Keterangan = "Pembersihan dan balut luka", Harga = 90000, Status = 1 },
            new JasaEntity { Icd9 = "99.29", NamaJasa = "Injeksi Obat", Keterangan = "Pemberian obat injeksi", Harga = 45000, Status = 1 },
            new JasaEntity { Icd9 = "93.94", NamaJasa = "Nebulizer", Keterangan = "Terapi uap/nebulizer", Harga = 85000, Status = 1 },
            new JasaEntity { Icd9 = "89.52", NamaJasa = "Pemeriksaan EKG", Keterangan = "Elektrokardiografi", Harga = 125000, Status = 1 },
            new JasaEntity { Icd9 = "90.59", NamaJasa = "Pemeriksaan Laboratorium Sederhana", Keterangan = "Pemeriksaan lab dasar", Harga = 100000, Status = 1 },
            new JasaEntity { Icd9 = "87.44", NamaJasa = "Radiologi Thorax", Keterangan = "Foto rontgen thorax", Harga = 180000, Status = 1 },
            new JasaEntity { Icd9 = "99.99", NamaJasa = "Administrasi Rawat Jalan", Keterangan = "Biaya administrasi layanan", Harga = 25000, Status = 1 },
            new JasaEntity { Icd9 = "89.03", NamaJasa = "Kontrol Ulang", Keterangan = "Kunjungan kontrol pasca terapi", Harga = 50000, Status = 1 }
        };

        foreach (var service in services)
        {
            if (!await dbContext.Jasa.AnyAsync(x => x.NamaJasa == service.NamaJasa && x.DeletedAt == null))
            {
                dbContext.Jasa.Add(service);
            }
        }

        var diagnoses = new[]
        {
            new DiagnosaEntity { KodeDiagnosa = "J00", KodeSnomed = "82272006", NamaDiagnosa = "Common cold", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "I10", KodeSnomed = "38341003", NamaDiagnosa = "Essential hypertension", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "E11", KodeSnomed = "44054006", NamaDiagnosa = "Type 2 diabetes mellitus", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "K29", KodeSnomed = "4556007", NamaDiagnosa = "Gastritis", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "R50", KodeSnomed = "386661006", NamaDiagnosa = "Fever", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "A09", KodeSnomed = "409966000", NamaDiagnosa = "Infectious gastroenteritis", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "J45", KodeSnomed = "195967001", NamaDiagnosa = "Asthma", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "M54", KodeSnomed = "279039007", NamaDiagnosa = "Dorsalgia", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "L20", KodeSnomed = "24079001", NamaDiagnosa = "Atopic dermatitis", Status = 1 },
            new DiagnosaEntity { KodeDiagnosa = "N39", KodeSnomed = "68566005", NamaDiagnosa = "Urinary tract infection", Status = 1 }
        };

        foreach (var diagnosis in diagnoses)
        {
            if (!await dbContext.Diagnosa.AnyAsync(x => x.KodeDiagnosa == diagnosis.KodeDiagnosa && x.DeletedAt == null))
            {
                dbContext.Diagnosa.Add(diagnosis);
            }
        }

        await dbContext.SaveChangesAsync();
    }
}
