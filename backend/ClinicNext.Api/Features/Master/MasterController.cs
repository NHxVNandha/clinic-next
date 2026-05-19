using ClinicNext.Api.Data;
using ClinicNext.Api.Domain.Entities;
using ClinicNext.Api.Models.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClinicNext.Api.Features.Master;

[ApiController]
[Authorize]
[Route("api/v1/master")]
public class MasterController : ControllerBase
{
    private readonly ClinicDbContext _dbContext;

    public MasterController(ClinicDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("pasien")]
    public async Task<IActionResult> GetPasien([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query = _dbContext.Pasien
            .Where(x => x.DeletedAt == null)
            .OrderByDescending(x => x.Id);

        var total = await query.CountAsync();

        var data = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.IdPasien,
                x.Nik,
                x.Nama,
                x.NoHp,
                x.Email
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = data
        }, "Data pasien berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("dokter")]
    public async Task<IActionResult> GetDokter([FromQuery] string? search = null)
    {
        var query = _dbContext.Dokter
            .Where(x => x.DeletedAt == null)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.KdDokter ?? string.Empty).Contains(search) ||
                (x.NamaDokter ?? string.Empty).Contains(search));
        }

        var data = await query
            .OrderBy(x => x.KdDokter)
            .Select(x => new
            {
                x.Id,
                x.KdDokter,
                x.NamaDokter
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(data, "Data dokter berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("jasa")]
    public async Task<IActionResult> GetJasa([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query = _dbContext.Jasa
            .Where(x => x.DeletedAt == null)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.Icd9 ?? string.Empty).Contains(search) ||
                (x.NamaJasa ?? string.Empty).Contains(search) ||
                (x.Keterangan ?? string.Empty).Contains(search));
        }

        var total = await query.CountAsync();

        var data = await query
            .OrderBy(x => x.NamaJasa)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.Icd9,
                x.NamaJasa,
                x.Keterangan,
                x.Harga,
                x.Status
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = data
        }, "Data jasa berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("diagnosa")]
    public async Task<IActionResult> GetDiagnosa([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query = _dbContext.Diagnosa
            .Where(x => x.DeletedAt == null)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.KodeDiagnosa ?? string.Empty).Contains(search) ||
                (x.KodeSnomed ?? string.Empty).Contains(search) ||
                (x.NamaDiagnosa ?? string.Empty).Contains(search));
        }

        var total = await query.CountAsync();

        var data = await query
            .OrderBy(x => x.KodeDiagnosa)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.KodeDiagnosa,
                x.KodeSnomed,
                x.NamaDiagnosa,
                x.Status
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = data
        }, "Data diagnosa berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("jasa/{id:long}")]
    public async Task<IActionResult> GetJasaDetail(long id)
    {
        var data = await _dbContext.Jasa
            .Where(x => x.DeletedAt == null && x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Icd9,
                x.NamaJasa,
                x.Keterangan,
                x.Harga,
                x.Status
            })
            .FirstOrDefaultAsync();

        if (data == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data jasa tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.Ok(data, "Detail jasa berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("diagnosa/{id:long}")]
    public async Task<IActionResult> GetDiagnosaDetail(long id)
    {
        var data = await _dbContext.Diagnosa
            .Where(x => x.DeletedAt == null && x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.KodeDiagnosa,
                x.KodeSnomed,
                x.NamaDiagnosa,
                x.Status
            })
            .FirstOrDefaultAsync();

        if (data == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data diagnosa tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.Ok(data, "Detail diagnosa berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("jasa")]
    public async Task<IActionResult> UpsertJasa([FromBody] UpsertJasaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NamaJasa))
        {
            return BadRequest(ApiResponse<object>.Fail("namaJasa wajib diisi.", HttpContext.TraceIdentifier));
        }

        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        JasaEntity entity;
        if (request.Id.HasValue)
        {
            entity = await _dbContext.Jasa.FirstOrDefaultAsync(x => x.Id == request.Id.Value && x.DeletedAt == null)
                ?? new JasaEntity();
            if (entity.Id == 0)
            {
                _dbContext.Jasa.Add(entity);
            }
        }
        else
        {
            entity = new JasaEntity();
            _dbContext.Jasa.Add(entity);
        }

        entity.Icd9 = request.Icd9;
        entity.NamaJasa = request.NamaJasa;
        entity.Keterangan = request.Keterangan;
        entity.Harga = request.Harga;
        entity.Status = request.Status;
        entity.InputBy = userId.Value;

        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { entity.Id }, "Data jasa berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpPost("diagnosa")]
    public async Task<IActionResult> UpsertDiagnosa([FromBody] UpsertDiagnosaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.KodeDiagnosa) || string.IsNullOrWhiteSpace(request.NamaDiagnosa))
        {
            return BadRequest(ApiResponse<object>.Fail("kodeDiagnosa dan namaDiagnosa wajib diisi.", HttpContext.TraceIdentifier));
        }

        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        DiagnosaEntity entity;
        if (request.Id.HasValue)
        {
            entity = await _dbContext.Diagnosa.FirstOrDefaultAsync(x => x.Id == request.Id.Value && x.DeletedAt == null)
                ?? new DiagnosaEntity();
            if (entity.Id == 0)
            {
                _dbContext.Diagnosa.Add(entity);
            }
        }
        else
        {
            entity = new DiagnosaEntity();
            _dbContext.Diagnosa.Add(entity);
        }

        entity.KodeDiagnosa = request.KodeDiagnosa;
        entity.KodeSnomed = request.KodeSnomed;
        entity.NamaDiagnosa = request.NamaDiagnosa;
        entity.Status = request.Status;
        entity.InputBy = userId.Value;

        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { entity.Id }, "Data diagnosa berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("jasa/{id:long}")]
    public async Task<IActionResult> DeleteJasa(long id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var entity = await _dbContext.Jasa.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (entity == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data jasa tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        entity.DeletedAt = DateTime.UtcNow;
        entity.InputBy = userId.Value;

        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { entity.Id }, "Data jasa berhasil dihapus.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("diagnosa/{id:long}")]
    public async Task<IActionResult> DeleteDiagnosa(long id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var entity = await _dbContext.Diagnosa.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (entity == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data diagnosa tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        entity.DeletedAt = DateTime.UtcNow;
        entity.InputBy = userId.Value;

        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { entity.Id }, "Data diagnosa berhasil dihapus.", HttpContext.TraceIdentifier));
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query = _dbContext.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.Email.Contains(search));
        }

        var total = await query.CountAsync();
        var data = await query
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Email,
                x.RoleId,
                Role = x.RoleId == 1 ? "admin" : "user"
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = data
        }, "Data user berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("user/{id:int}")]
    public async Task<IActionResult> GetUserDetail(int id)
    {
        var data = await _dbContext.Users
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Email,
                x.RoleId,
                Role = x.RoleId == 1 ? "admin" : "user"
            })
            .FirstOrDefaultAsync();

        if (data == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data user tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.Ok(data, "Detail user berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("setting")]
    public async Task<IActionResult> GetSetting([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query = _dbContext.Setting
            .Where(x => x.DeletedAt == null)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.Jenis ?? string.Empty).Contains(search) ||
                (x.Nama ?? string.Empty).Contains(search) ||
                (x.Email ?? string.Empty).Contains(search));
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
        }, "Data setting berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("setting")]
    public async Task<IActionResult> UpsertSetting([FromBody] UpsertSettingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Jenis) || string.IsNullOrWhiteSpace(request.Nama))
        {
            return BadRequest(ApiResponse<object>.Fail("jenis dan nama wajib diisi.", HttpContext.TraceIdentifier));
        }

        var userName = User.FindFirstValue("name");
        if (string.IsNullOrWhiteSpace(userName))
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        SettingEntity entity;
        if (request.Id.HasValue)
        {
            entity = await _dbContext.Setting.FirstOrDefaultAsync(x => x.Id == request.Id.Value && x.DeletedAt == null)
                ?? new SettingEntity();
            if (entity.Id == 0)
            {
                _dbContext.Setting.Add(entity);
            }
        }
        else
        {
            entity = new SettingEntity();
            _dbContext.Setting.Add(entity);
        }

        entity.Jenis = request.Jenis;
        entity.Nama = request.Nama;
        entity.Alamat = request.Alamat;
        entity.Email = request.Email;
        entity.NoHp = request.NoHp;
        entity.Phone = request.Phone;
        entity.Logo = request.Logo;
        entity.LogoSidebar = request.LogoSidebar;
        entity.TitleSidebar = request.TitleSidebar;
        entity.Keterangan = request.Keterangan;
        entity.InputBy = userName;

        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { entity.Id }, "Data setting berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpGet("pasien/{id:long}")]
    public async Task<IActionResult> GetPasienDetail(long id)
    {
        var data = await _dbContext.Pasien
            .Where(x => x.Id == id && x.DeletedAt == null)
            .Select(x => new
            {
                x.Id,
                x.IdPasien,
                x.Nik,
                x.Nama,
                x.NoHp,
                x.Email,
                x.Alamat,
                x.JenisKelamin
            })
            .FirstOrDefaultAsync();

        if (data == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pasien tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.Ok(data, "Detail pasien berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("pasien/{id:long}")]
    public async Task<IActionResult> DeletePasien(long id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var pasien = await _dbContext.Pasien.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (pasien == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pasien tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        pasien.DeletedAt = DateTime.UtcNow;
        pasien.InputBy = userId.Value;
        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { pasien.Id }, "Data pasien berhasil dihapus.", HttpContext.TraceIdentifier));
    }

    [HttpPost("dokter")]
    public async Task<IActionResult> UpsertDokter([FromBody] UpsertDokterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.KdDokter) || string.IsNullOrWhiteSpace(request.NamaDokter))
        {
            return BadRequest(ApiResponse<object>.Fail("kdDokter dan namaDokter wajib diisi.", HttpContext.TraceIdentifier));
        }

        DokterEntity entity;
        if (request.Id.HasValue)
        {
            entity = await _dbContext.Dokter.FirstOrDefaultAsync(x => x.Id == request.Id.Value && x.DeletedAt == null)
                ?? new DokterEntity();
            if (entity.Id == 0)
            {
                _dbContext.Dokter.Add(entity);
            }
        }
        else
        {
            entity = new DokterEntity();
            _dbContext.Dokter.Add(entity);
        }

        entity.KdDokter = request.KdDokter;
        entity.NamaDokter = request.NamaDokter;
        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { entity.Id }, "Data dokter berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("dokter/{id:long}")]
    public async Task<IActionResult> DeleteDokter(long id)
    {
        var dokter = await _dbContext.Dokter.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (dokter == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data dokter tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        dokter.DeletedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { dokter.Id }, "Data dokter berhasil dihapus.", HttpContext.TraceIdentifier));
    }

    [HttpGet("kode-wilayah")]
    public async Task<IActionResult> GetKodeWilayah([FromQuery] string? parent = null, [FromQuery] string? search = null)
    {
        var query = _dbContext.KodeWilayah.AsQueryable();
        if (!string.IsNullOrWhiteSpace(parent))
        {
            query = query.Where(x => x.Parent == parent);
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => (x.KodeWilayah ?? string.Empty).Contains(search) || (x.NamaWilayah ?? string.Empty).Contains(search));
        }

        var data = await query.OrderBy(x => x.KodeWilayah).Take(200).ToListAsync();
        return Ok(ApiResponse<object>.Ok(data, "Data kode wilayah berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("kode-pos")]
    public async Task<IActionResult> GetKodePos([FromQuery] string? search = null)
    {
        var query = _dbContext.KodePos.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.KodePos ?? string.Empty).Contains(search) ||
                (x.Kelurahan ?? string.Empty).Contains(search) ||
                (x.Kecamatan ?? string.Empty).Contains(search) ||
                (x.Kabupaten ?? string.Empty).Contains(search));
        }

        var data = await query.OrderBy(x => x.KodePos).Take(200).ToListAsync();
        return Ok(ApiResponse<object>.Ok(data, "Data kode pos berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("standart-field-group")]
    public async Task<IActionResult> GetStandartFieldGroup()
    {
        var data = await _dbContext.StandartFieldGroup
            .Where(x => x.DeletedAt == null)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(data, "Data standart field group berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("standart-field")]
    public async Task<IActionResult> GetStandartField([FromQuery] long? idFieldGroup = null)
    {
        var query = _dbContext.StandartField
            .Where(x => x.DeletedAt == null)
            .AsQueryable();

        if (idFieldGroup.HasValue)
        {
            query = query.Where(x => x.IdFieldGroup == idFieldGroup.Value);
        }

        var data = await query.OrderBy(x => x.Id).ToListAsync();
        return Ok(ApiResponse<object>.Ok(data, "Data standart field berhasil diambil.", HttpContext.TraceIdentifier));
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
}

public class UpsertJasaRequest
{
    public long? Id { get; set; }

    [MaxLength(50)]
    public string? Icd9 { get; set; }

    [Required]
    [MaxLength(255)]
    public string? NamaJasa { get; set; }

    [MaxLength(1000)]
    public string? Keterangan { get; set; }

    [Range(0, 1000000000)]
    public decimal? Harga { get; set; }

    [Range(0, 10)]
    public int? Status { get; set; }
}

public class UpsertDiagnosaRequest
{
    public long? Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string? KodeDiagnosa { get; set; }

    [MaxLength(100)]
    public string? KodeSnomed { get; set; }

    [Required]
    [MaxLength(255)]
    public string? NamaDiagnosa { get; set; }

    [Range(0, 10)]
    public int? Status { get; set; }
}

public class UpsertSettingRequest
{
    public long? Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string? Jenis { get; set; }

    [Required]
    [MaxLength(255)]
    public string? Nama { get; set; }

    [MaxLength(1000)]
    public string? Alamat { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(50)]
    public string? NoHp { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Logo { get; set; }

    [MaxLength(255)]
    public string? LogoSidebar { get; set; }

    [MaxLength(255)]
    public string? TitleSidebar { get; set; }

    [MaxLength(1000)]
    public string? Keterangan { get; set; }
}

public class UpsertDokterRequest
{
    public long? Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string? KdDokter { get; set; }

    [Required]
    [MaxLength(255)]
    public string? NamaDokter { get; set; }
}
