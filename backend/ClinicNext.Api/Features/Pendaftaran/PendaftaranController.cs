using ClinicNext.Api.Data;
using ClinicNext.Api.Domain.Entities;
using ClinicNext.Api.Models.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClinicNext.Api.Features.Pendaftaran;

[ApiController]
[Authorize]
[Route("api/v1/pendaftaran")]
public class PendaftaranController : ControllerBase
{
    private readonly ClinicDbContext _dbContext;

    public PendaftaranController(ClinicDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? tanggal = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query =
            from p in _dbContext.Pendaftaran
            join ps in _dbContext.Pasien on p.IdPasien equals ps.Id
            join d in _dbContext.Dokter on p.KdDokter equals d.KdDokter into dokterJoin
            from d in dokterJoin.DefaultIfEmpty()
            where p.DeletedAt == null && ps.DeletedAt == null
            select new
            {
                p.Id,
                p.IdRegistrasi,
                p.Tanggal,
                p.Status,
                p.KdDokter,
                PasienId = ps.Id,
                ps.IdPasien,
                ps.Nik,
                NamaPasien = ps.Nama,
                DokterNama = d != null ? d.NamaDokter : null
            };

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => (x.Status ?? string.Empty) == status);
        }

        if (!string.IsNullOrWhiteSpace(tanggal))
        {
            query = query.Where(x => (x.Tanggal ?? string.Empty) == tanggal);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.IdRegistrasi ?? string.Empty).Contains(search) ||
                (x.IdPasien ?? string.Empty).Contains(search) ||
                (x.Nik ?? string.Empty).Contains(search) ||
                (x.NamaPasien ?? string.Empty).Contains(search) ||
                (x.KdDokter ?? string.Empty).Contains(search) ||
                (x.DokterNama ?? string.Empty).Contains(search));
        }

        var total = await query.CountAsync();
        var data = await query
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = data
        }, "Data pendaftaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetDetail(long id)
    {
        var data = await (
            from p in _dbContext.Pendaftaran
            join ps in _dbContext.Pasien on p.IdPasien equals ps.Id
            join d in _dbContext.Dokter on p.KdDokter equals d.KdDokter into dokterJoin
            from d in dokterJoin.DefaultIfEmpty()
            where p.DeletedAt == null && p.Id == id
            select new
            {
                p.Id,
                p.IdRegistrasi,
                p.Tanggal,
                p.Status,
                p.KdDokter,
                Pasien = new
                {
                    ps.Id,
                    ps.IdPasien,
                    ps.Nik,
                    ps.Nama,
                    ps.NoHp,
                    ps.Email
                },
                Dokter = d == null ? null : new
                {
                    d.Id,
                    d.KdDokter,
                    d.NamaDokter
                }
            }).FirstOrDefaultAsync();

        if (data == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.Ok(data, "Detail pendaftaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePendaftaranRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        if (string.IsNullOrWhiteSpace(request.Tanggal))
        {
            request.Tanggal = DateTime.Now.ToString("dd-MM-yyyy");
        }

        var pasien = await _dbContext.Pasien
            .FirstOrDefaultAsync(x => x.Id == request.IdPasien && x.DeletedAt == null);

        if (pasien == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pasien tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var dokter = await _dbContext.Dokter
            .FirstOrDefaultAsync(x => x.KdDokter == request.KdDokter && x.DeletedAt == null);

        if (dokter == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data dokter tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var idRegistrasi = await GenerateRegistrationIdAsync();

        var entity = new PendaftaranEntity
        {
            IdRegistrasi = idRegistrasi,
            IdPasien = request.IdPasien,
            KdDokter = request.KdDokter,
            Tanggal = request.Tanggal,
            InputBy = userId.Value,
            Status = "1"
        };

        _dbContext.Pendaftaran.Add(entity);
        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            entity.Id,
            entity.IdRegistrasi,
            entity.Status
        }, "Pendaftaran berhasil dibuat.", HttpContext.TraceIdentifier));
    }

    [HttpPost("pasien-baru")]
    public async Task<IActionResult> CreateWithNewPatient([FromBody] CreatePendaftaranPasienBaruRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        if (string.IsNullOrWhiteSpace(request.TanggalKunjungan))
        {
            request.TanggalKunjungan = DateTime.Now.ToString("dd-MM-yyyy");
        }

        var dokter = await _dbContext.Dokter
            .FirstOrDefaultAsync(x => x.KdDokter == request.KdDokter && x.DeletedAt == null);

        if (dokter == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data dokter tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        if (!string.IsNullOrWhiteSpace(request.Nik))
        {
            var existsNik = await _dbContext.Pasien.AnyAsync(x => x.Nik == request.Nik && x.DeletedAt == null);
            if (existsNik)
            {
                return Conflict(ApiResponse<object>.Fail("NIK sudah terdaftar.", HttpContext.TraceIdentifier));
            }
        }

        var idRegistrasi = await GenerateRegistrationIdAsync();
        var idPasien = await GeneratePatientCodeAsync();

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        var pasien = new PasienEntity
        {
            IdPasien = idPasien,
            IdIhs = request.IdIhs,
            Nik = request.Nik,
            Npwp = request.Npwp,
            Nama = request.Nama,
            Day = request.Day,
            Month = request.Month,
            Year = request.Year,
            JenisKelamin = request.JenisKelamin,
            Alamat = request.Alamat,
            Rt = request.Rt,
            Rw = request.Rw,
            Provinsi = SafePrefix(request.Kelurahan, 2, "35"),
            Kota = !string.IsNullOrWhiteSpace(request.Kota) ? request.Kota : SafePrefix(request.Kelurahan, 4, "3578"),
            Kecamatan = SafePrefix(request.Kelurahan, 6, "357808"),
            KodePos = !string.IsNullOrWhiteSpace(request.KodePos) ? request.KodePos : "60231",
            Kelurahan = !string.IsNullOrWhiteSpace(request.Kelurahan) ? request.Kelurahan : "3578081001",
            Agama = request.Agama,
            StatusKawin = request.StatusKawin,
            Pekerjaan = request.Pekerjaan,
            NoHp = request.NoHp,
            Email = request.Email,
            InputBy = userId.Value
        };

        _dbContext.Pasien.Add(pasien);
        await _dbContext.SaveChangesAsync();

        var pendaftaran = new PendaftaranEntity
        {
            IdRegistrasi = idRegistrasi,
            IdPasien = pasien.Id,
            KdDokter = request.KdDokter,
            Tanggal = request.TanggalKunjungan,
            InputBy = userId.Value,
            Status = "1"
        };

        _dbContext.Pendaftaran.Add(pendaftaran);
        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Pasien = new { pasien.Id, pasien.IdPasien, pasien.Nama, pasien.Nik },
            Pendaftaran = new { pendaftaran.Id, pendaftaran.IdRegistrasi, pendaftaran.Status }
        }, "Pasien baru dan pendaftaran berhasil dibuat.", HttpContext.TraceIdentifier));
    }

    [HttpPost("{idRegistrasi}/void")]
    public async Task<IActionResult> VoidPendaftaran(string idRegistrasi)
    {
        var updated = await _dbContext.Pendaftaran
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, "4")
                .SetProperty(x => x.InputBy, GetCurrentUserId()));

        if (updated == 0)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        await _dbContext.Database.ExecuteSqlInterpolatedAsync($"UPDATE tt_tindakan SET status = 4 WHERE id_registrasi = {idRegistrasi}");
        await _dbContext.Database.ExecuteSqlInterpolatedAsync($"UPDATE tt_tindakan_detail SET status = 4 WHERE id_tindakan IN (SELECT id FROM tt_tindakan WHERE id_registrasi = {idRegistrasi})");
        await _dbContext.Database.ExecuteSqlInterpolatedAsync($"UPDATE tt_pembayaran SET status = 4 WHERE id_registrasi = {idRegistrasi}");

        return Ok(ApiResponse<object>.Ok(new { idRegistrasi }, "Pendaftaran berhasil di-void.", HttpContext.TraceIdentifier));
    }

    [HttpPost("{idRegistrasi}/pulang")]
    public async Task<IActionResult> PulangPendaftaran(string idRegistrasi)
    {
        var updated = await _dbContext.Pendaftaran
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, "3")
                .SetProperty(x => x.InputBy, GetCurrentUserId()));

        if (updated == 0)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        await _dbContext.Database.ExecuteSqlInterpolatedAsync($"UPDATE tt_tindakan SET status = 4 WHERE id_registrasi = {idRegistrasi}");
        await _dbContext.Database.ExecuteSqlInterpolatedAsync($"UPDATE tt_tindakan_detail SET status = 4 WHERE id_tindakan IN (SELECT id FROM tt_tindakan WHERE id_registrasi = {idRegistrasi})");

        return Ok(ApiResponse<object>.Ok(new { idRegistrasi }, "Pasien berhasil dipulangkan.", HttpContext.TraceIdentifier));
    }

    private int? GetCurrentUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (int.TryParse(sub, out var userId))
        {
            return userId;
        }

        return null;
    }

    private async Task<string> GenerateRegistrationIdAsync()
    {
        var total = await _dbContext.Pendaftaran.CountAsync();
        var sequence = total + 1;
        return DateTime.Now.ToString("yyMMdd") + sequence.ToString().PadLeft(5, '0');
    }

    private async Task<string> GeneratePatientCodeAsync()
    {
        var total = await _dbContext.Pasien.CountAsync();
        var sequence = total + 1;
        return DateTime.Now.ToString("yyMMdd") + sequence.ToString().PadLeft(4, '0');
    }

    private static string SafePrefix(string? value, int length, string fallback)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return fallback;
        }

        return value.Length >= length ? value[..length] : fallback;
    }
}

public class CreatePendaftaranRequest
{
    [Required]
    public long IdPasien { get; set; }

    [Required]
    [MaxLength(50)]
    public string KdDokter { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Tanggal { get; set; }
}

public class CreatePendaftaranPasienBaruRequest
{
    [Required]
    [MaxLength(255)]
    public string Nama { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Nik { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string KdDokter { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? IdIhs { get; set; }

    [MaxLength(50)]
    public string? Npwp { get; set; }

    [MaxLength(2)]
    public string? Day { get; set; }

    [MaxLength(2)]
    public string? Month { get; set; }

    [MaxLength(4)]
    public string? Year { get; set; }

    [MaxLength(10)]
    public string? JenisKelamin { get; set; }

    [MaxLength(1000)]
    public string? Alamat { get; set; }

    [MaxLength(5)]
    public string? Rt { get; set; }

    [MaxLength(5)]
    public string? Rw { get; set; }

    [MaxLength(10)]
    public string? Kota { get; set; }

    [MaxLength(10)]
    public string? Kelurahan { get; set; }

    [MaxLength(10)]
    public string? KodePos { get; set; }

    [MaxLength(10)]
    public string? Agama { get; set; }

    [MaxLength(10)]
    public string? StatusKawin { get; set; }

    [MaxLength(10)]
    public string? Pekerjaan { get; set; }

    [MaxLength(50)]
    public string? NoHp { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? TanggalKunjungan { get; set; }
}
