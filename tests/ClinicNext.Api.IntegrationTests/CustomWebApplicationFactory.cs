using ClinicNext.Api.Data;
using ClinicNext.Api.Domain.Entities;
using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ClinicNext.Api.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ClinicDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ClinicDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });

            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();

            if (_connection.State != System.Data.ConnectionState.Open)
            {
                _connection.Open();
            }
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();

            Seed(db);
        });
    }

    private static void Seed(ClinicDbContext db)
    {
        var user = new UserEntity
        {
            Id = 1,
            Name = "Admin Test",
            Email = "admin@test.local",
            Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            RoleId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var pasien = new PasienEntity
        {
            Id = 1,
            IdPasien = "PS001",
            Nik = "1234567890123456",
            Nama = "Pasien Test",
            NoHp = "08123456789",
            Email = "pasien@test.local"
        };

        var dokter = new DokterEntity
        {
            Id = 1,
            KdDokter = "DK001",
            NamaDokter = "dr. Test"
        };

        var pendaftaran = new PendaftaranEntity
        {
            Id = 1,
            IdRegistrasi = "REG001",
            IdPasien = pasien.Id,
            KdDokter = dokter.KdDokter,
            InputBy = user.Id,
            Tanggal = "01-01-2026",
            Status = "1"
        };

        var jasa = new JasaEntity
        {
            Id = 1,
            Icd9 = "J001",
            NamaJasa = "Jasa Test",
            Harga = 10000,
            Status = 1,
            InputBy = user.Id
        };

        db.Users.Add(user);
        db.Pasien.Add(pasien);
        db.Dokter.Add(dokter);
        db.Pendaftaran.Add(pendaftaran);
        db.Jasa.Add(jasa);
        db.SaveChanges();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _connection.Dispose();
        }
    }
}
