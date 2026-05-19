using ClinicNext.Api.Data;
using ClinicNext.Api.Models.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClinicNext.Api.Features.Pelayanan;

[ApiController]
[Authorize]
[Route("api/v1/pelayanan")]
public class PelayananController : ControllerBase
{
    private readonly ClinicDbContext _dbContext;

    public PelayananController(ClinicDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? tanggal = null,
        [FromQuery] string? status = null)
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
                ps.IdPasien,
                ps.Nik,
                NamaPasien = ps.Nama,
                DokterNama = d != null ? d.NamaDokter : null
            };

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => (x.Status ?? string.Empty) == status);
        }
        else
        {
            query = query.Where(x => x.Status == "1" || x.Status == "2");
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
        }, "Data pelayanan berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{idRegistrasi}")]
    public async Task<IActionResult> GetDetail(string idRegistrasi)
    {
        var data = await (
            from p in _dbContext.Pendaftaran
            join ps in _dbContext.Pasien on p.IdPasien equals ps.Id
            join d in _dbContext.Dokter on p.KdDokter equals d.KdDokter into dokterJoin
            from d in dokterJoin.DefaultIfEmpty()
            where p.DeletedAt == null && p.IdRegistrasi == idRegistrasi
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
            return NotFound(ApiResponse<object>.Fail("Data pelayanan tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.Ok(data, "Detail pelayanan berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{idRegistrasi}/tindakan")]
    public async Task<IActionResult> GetTindakanByRegistrasi(string idRegistrasi)
    {
        var header = await _dbContext.Tindakan
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data tindakan tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var details = await (
            from td in _dbContext.TindakanDetail
            join j in _dbContext.Jasa on td.IdJasa equals j.Id
            where td.IdTindakan == header.Id && td.DeletedAt == null
            select new
            {
                td.Id,
                td.IdJasa,
                Jasa = j.NamaJasa,
                td.Harga,
                td.Jumlah,
                td.Total,
                td.Status
            }).ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Header = new
            {
                header.Id,
                header.IdTransaksi,
                header.IdRegistrasi,
                header.IdPasien,
                header.KdDokter,
                header.Tanggal,
                header.Total,
                header.Status
            },
            Details = details
        }, "Data tindakan berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("{idRegistrasi}/tindakan")]
    public async Task<IActionResult> CreateTindakan(string idRegistrasi, [FromBody] CreateTindakanRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Item tindakan wajib diisi.", HttpContext.TraceIdentifier));
        }

        var existing = await _dbContext.Tindakan.AnyAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (existing)
        {
            return Conflict(ApiResponse<object>.Fail("Pasien sudah ada tindakan untuk registrasi ini.", HttpContext.TraceIdentifier));
        }

        var pendaftaran = await _dbContext.Pendaftaran
            .FirstOrDefaultAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (pendaftaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        if (pendaftaran.Status == "3" || pendaftaran.Status == "4")
        {
            return BadRequest(ApiResponse<object>.Fail("Pendaftaran sudah selesai/void, tidak bisa ditambahkan tindakan.", HttpContext.TraceIdentifier));
        }

        var pasien = await _dbContext.Pasien
            .FirstOrDefaultAsync(x => x.Id == pendaftaran.IdPasien && x.DeletedAt == null);
        if (pasien == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pasien tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        var total = request.Items.Sum(x => x.Harga * x.Jumlah);
        var idTransaksi = await GenerateTindakanCodeAsync();

        var header = new Domain.Entities.TindakanEntity
        {
            IdTransaksi = idTransaksi,
            IdRegistrasi = idRegistrasi,
            IdPasien = pasien.IdPasien,
            KdDokter = pendaftaran.KdDokter,
            Tanggal = DateTime.Now.ToString("yyyy-MM-dd"),
            Total = total,
            Status = "1",
            InputBy = userId.Value
        };

        _dbContext.Tindakan.Add(header);
        await _dbContext.SaveChangesAsync();

        foreach (var item in request.Items)
        {
            _dbContext.TindakanDetail.Add(new Domain.Entities.TindakanDetailEntity
            {
                IdTindakan = header.Id,
                IdJasa = item.IdJasa,
                Harga = item.Harga,
                Jumlah = item.Jumlah,
                Total = item.Harga * item.Jumlah,
                Status = "1"
            });
        }

        pendaftaran.Status = "2";
        pendaftaran.InputBy = userId.Value;

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            header.Id,
            header.IdTransaksi,
            header.IdRegistrasi,
            header.Total
        }, "Tindakan berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("{idRegistrasi}/tindakan/{detailId:long}")]
    public async Task<IActionResult> VoidTindakanDetail(string idRegistrasi, long detailId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var header = await _dbContext.Tindakan
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Header tindakan tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        if (header.Status == "3" || header.Status == "4")
        {
            return BadRequest(ApiResponse<object>.Fail("Tindakan sudah selesai/void, tidak bisa diubah.", HttpContext.TraceIdentifier));
        }

        var detail = await _dbContext.TindakanDetail
            .FirstOrDefaultAsync(x => x.Id == detailId && x.IdTindakan == header.Id && x.DeletedAt == null);

        if (detail == null)
        {
            return NotFound(ApiResponse<object>.Fail("Detail tindakan tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        detail.DeletedAt = DateTime.UtcNow;
        detail.Status = "4";

        var newTotal = await _dbContext.TindakanDetail
            .Where(x => x.IdTindakan == header.Id && x.DeletedAt == null && x.Id != detail.Id)
            .SumAsync(x => (decimal?)x.Total) ?? 0m;

        header.Total = newTotal;
        header.InputBy = userId.Value;
        if (newTotal == 0)
        {
            header.Status = "4";
        }

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            HeaderId = header.Id,
            DetailId = detail.Id,
            TotalBaru = header.Total,
            Status = header.Status
        }, "Detail tindakan berhasil di-void.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{idRegistrasi}/resep")]
    public async Task<IActionResult> GetResepByRegistrasi(string idRegistrasi)
    {
        var header = await _dbContext.Resep
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data resep tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var details = await _dbContext.ResepDetail
            .Where(x => x.IdResep == header.Id && x.DeletedAt == null)
            .OrderBy(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.IdBarang,
                x.NamaObat,
                x.AturanPakai,
                x.Jumlah,
                x.Harga,
                x.Total,
                x.Status
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Header = new
            {
                header.Id,
                header.IdResep,
                header.IdRegistrasi,
                header.IdPasien,
                header.KdDokter,
                header.Racikan,
                header.Tanggal,
                header.Total,
                header.Status
            },
            Details = details
        }, "Data resep berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("{idRegistrasi}/resep")]
    public async Task<IActionResult> CreateResep(string idRegistrasi, [FromBody] CreateResepRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Item resep wajib diisi.", HttpContext.TraceIdentifier));
        }

        var existing = await _dbContext.Resep
            .AnyAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (existing)
        {
            return Conflict(ApiResponse<object>.Fail("Resep untuk registrasi ini sudah ada.", HttpContext.TraceIdentifier));
        }

        var pendaftaran = await _dbContext.Pendaftaran
            .FirstOrDefaultAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (pendaftaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        if (pendaftaran.Status == "3" || pendaftaran.Status == "4")
        {
            return BadRequest(ApiResponse<object>.Fail("Pendaftaran sudah selesai/void, tidak bisa ditambahkan resep.", HttpContext.TraceIdentifier));
        }

        var pasien = await _dbContext.Pasien
            .FirstOrDefaultAsync(x => x.Id == pendaftaran.IdPasien && x.DeletedAt == null);
        if (pasien == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pasien tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        var total = request.Items.Sum(x => x.Harga * x.Jumlah);
        var idResep = await GenerateResepCodeAsync();

        var header = new Domain.Entities.ResepEntity
        {
            IdResep = idResep,
            IdRegistrasi = idRegistrasi,
            IdPasien = pasien.IdPasien,
            KdDokter = pendaftaran.KdDokter,
            Racikan = request.Racikan,
            Tanggal = DateTime.Now.ToString("yyyy-MM-dd"),
            Total = total,
            Status = "1",
            InputBy = userId.Value
        };

        _dbContext.Resep.Add(header);
        await _dbContext.SaveChangesAsync();

        foreach (var item in request.Items)
        {
            _dbContext.ResepDetail.Add(new Domain.Entities.ResepDetailEntity
            {
                IdResep = header.Id,
                IdBarang = item.IdBarang,
                NamaObat = item.NamaObat,
                AturanPakai = item.AturanPakai,
                Jumlah = item.Jumlah,
                Harga = item.Harga,
                Total = item.Harga * item.Jumlah,
                Status = "1",
                InputBy = userId.Value
            });
        }

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            header.Id,
            header.IdResep,
            header.IdRegistrasi,
            header.Total
        }, "Resep berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{idRegistrasi}/alkes")]
    public async Task<IActionResult> GetAlkesByRegistrasi(string idRegistrasi)
    {
        var header = await _dbContext.AlkesPelayanan
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data alkes tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var details = await _dbContext.AlkesDetail
            .Where(x => x.IdAlkes == header.Id && x.DeletedAt == null)
            .OrderBy(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.KodeBarang,
                x.NamaBarang,
                x.Jumlah,
                x.Harga,
                x.Total,
                x.Status
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            Header = new
            {
                header.Id,
                header.IdAlkes,
                header.IdRegistrasi,
                header.IdPasien,
                header.KdDokter,
                header.Tanggal,
                header.Total,
                header.Status
            },
            Details = details
        }, "Data alkes berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("{idRegistrasi}/alkes")]
    public async Task<IActionResult> CreateAlkes(string idRegistrasi, [FromBody] CreateAlkesRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Item alkes wajib diisi.", HttpContext.TraceIdentifier));
        }

        var existing = await _dbContext.AlkesPelayanan
            .AnyAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (existing)
        {
            return Conflict(ApiResponse<object>.Fail("Data alkes untuk registrasi ini sudah ada.", HttpContext.TraceIdentifier));
        }

        var pendaftaran = await _dbContext.Pendaftaran
            .FirstOrDefaultAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (pendaftaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        if (pendaftaran.Status == "3" || pendaftaran.Status == "4")
        {
            return BadRequest(ApiResponse<object>.Fail("Pendaftaran sudah selesai/void, tidak bisa ditambahkan alkes.", HttpContext.TraceIdentifier));
        }

        var pasien = await _dbContext.Pasien
            .FirstOrDefaultAsync(x => x.Id == pendaftaran.IdPasien && x.DeletedAt == null);
        if (pasien == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pasien tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        var total = request.Items.Sum(x => x.Harga * x.Jumlah);
        var idAlkes = await GenerateAlkesCodeAsync();

        var header = new Domain.Entities.AlkesPelayananEntity
        {
            IdAlkes = idAlkes,
            IdRegistrasi = idRegistrasi,
            IdPasien = pasien.IdPasien,
            KdDokter = pendaftaran.KdDokter,
            Tanggal = DateTime.Now.ToString("yyyy-MM-dd"),
            Total = total,
            Status = "1",
            InputBy = userId.Value
        };

        _dbContext.AlkesPelayanan.Add(header);
        await _dbContext.SaveChangesAsync();

        foreach (var item in request.Items)
        {
            _dbContext.AlkesDetail.Add(new Domain.Entities.AlkesDetailEntity
            {
                IdAlkes = header.Id,
                KodeBarang = item.KodeBarang,
                NamaBarang = item.NamaBarang,
                Jumlah = item.Jumlah,
                Harga = item.Harga,
                Total = item.Harga * item.Jumlah,
                Status = "1",
                InputBy = userId.Value
            });
        }

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            header.Id,
            header.IdAlkes,
            header.IdRegistrasi,
            header.Total
        }, "Data alkes berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{idRegistrasi}/laboratorium")]
    public async Task<IActionResult> GetLaboratoriumByRegistrasi(string idRegistrasi)
    {
        var header = await _dbContext.Laboratorium
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data laboratorium tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var details = await _dbContext.LaboratoriumDetail
            .Where(x => x.IdLaboratorium == header.Id && x.DeletedAt == null)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new { Header = header, Details = details }, "Data laboratorium berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("{idRegistrasi}/laboratorium")]
    public async Task<IActionResult> CreateLaboratorium(string idRegistrasi, [FromBody] CreateLaboratoriumRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }
        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Item laboratorium wajib diisi.", HttpContext.TraceIdentifier));
        }

        var existing = await _dbContext.Laboratorium.AnyAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (existing)
        {
            return Conflict(ApiResponse<object>.Fail("Data laboratorium untuk registrasi ini sudah ada.", HttpContext.TraceIdentifier));
        }

        var pendaftaran = await _dbContext.Pendaftaran.FirstOrDefaultAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (pendaftaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }
        if (pendaftaran.Status == "3" || pendaftaran.Status == "4")
        {
            return BadRequest(ApiResponse<object>.Fail("Pendaftaran sudah selesai/void, tidak bisa ditambahkan laboratorium.", HttpContext.TraceIdentifier));
        }

        var pasien = await _dbContext.Pasien.FirstOrDefaultAsync(x => x.Id == pendaftaran.IdPasien && x.DeletedAt == null);
        if (pasien == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pasien tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();
        var total = request.Items.Sum(x => x.Harga * x.Jumlah);
        var idLab = await GenerateLaboratoriumCodeAsync();

        var header = new Domain.Entities.LaboratoriumEntity
        {
            IdLaboratorium = idLab,
            IdRegistrasi = idRegistrasi,
            IdPasien = pasien.IdPasien,
            KdDokter = pendaftaran.KdDokter,
            Tanggal = DateTime.Now.ToString("yyyy-MM-dd"),
            Total = total,
            Status = "1",
            InputBy = userId.Value
        };
        _dbContext.Laboratorium.Add(header);
        await _dbContext.SaveChangesAsync();

        foreach (var item in request.Items)
        {
            _dbContext.LaboratoriumDetail.Add(new Domain.Entities.LaboratoriumDetailEntity
            {
                IdLaboratorium = header.Id,
                KodePemeriksaan = item.KodePemeriksaan,
                NamaPemeriksaan = item.NamaPemeriksaan,
                Hasil = item.Hasil,
                Jumlah = item.Jumlah,
                Harga = item.Harga,
                Total = item.Harga * item.Jumlah,
                Status = "1",
                InputBy = userId.Value
            });
        }
        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new { header.Id, header.IdLaboratorium, header.Total }, "Data laboratorium berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{idRegistrasi}/radiologi")]
    public async Task<IActionResult> GetRadiologiByRegistrasi(string idRegistrasi)
    {
        var header = await _dbContext.Radiologi
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data radiologi tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var details = await _dbContext.RadiologiDetail
            .Where(x => x.IdRadiologi == header.Id && x.DeletedAt == null)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new { Header = header, Details = details }, "Data radiologi berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("{idRegistrasi}/radiologi")]
    public async Task<IActionResult> CreateRadiologi(string idRegistrasi, [FromBody] CreateRadiologiRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }
        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Item radiologi wajib diisi.", HttpContext.TraceIdentifier));
        }

        var existing = await _dbContext.Radiologi.AnyAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (existing)
        {
            return Conflict(ApiResponse<object>.Fail("Data radiologi untuk registrasi ini sudah ada.", HttpContext.TraceIdentifier));
        }

        var pendaftaran = await _dbContext.Pendaftaran.FirstOrDefaultAsync(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (pendaftaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }
        if (pendaftaran.Status == "3" || pendaftaran.Status == "4")
        {
            return BadRequest(ApiResponse<object>.Fail("Pendaftaran sudah selesai/void, tidak bisa ditambahkan radiologi.", HttpContext.TraceIdentifier));
        }

        var pasien = await _dbContext.Pasien.FirstOrDefaultAsync(x => x.Id == pendaftaran.IdPasien && x.DeletedAt == null);
        if (pasien == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pasien tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();
        var total = request.Items.Sum(x => x.Harga * x.Jumlah);
        var idRad = await GenerateRadiologiCodeAsync();

        var header = new Domain.Entities.RadiologiEntity
        {
            IdRadiologi = idRad,
            IdRegistrasi = idRegistrasi,
            IdPasien = pasien.IdPasien,
            KdDokter = pendaftaran.KdDokter,
            Tanggal = DateTime.Now.ToString("yyyy-MM-dd"),
            Total = total,
            Status = "1",
            InputBy = userId.Value
        };
        _dbContext.Radiologi.Add(header);
        await _dbContext.SaveChangesAsync();

        foreach (var item in request.Items)
        {
            _dbContext.RadiologiDetail.Add(new Domain.Entities.RadiologiDetailEntity
            {
                IdRadiologi = header.Id,
                KodePemeriksaan = item.KodePemeriksaan,
                NamaPemeriksaan = item.NamaPemeriksaan,
                Hasil = item.Hasil,
                Jumlah = item.Jumlah,
                Harga = item.Harga,
                Total = item.Harga * item.Jumlah,
                Status = "1",
                InputBy = userId.Value
            });
        }
        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new { header.Id, header.IdRadiologi, header.Total }, "Data radiologi berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("{idRegistrasi}/resep/{detailId:long}")]
    public async Task<IActionResult> VoidResepDetail(string idRegistrasi, long detailId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var header = await _dbContext.Resep.Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Header resep tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var detail = await _dbContext.ResepDetail.FirstOrDefaultAsync(x => x.Id == detailId && x.IdResep == header.Id && x.DeletedAt == null);
        if (detail == null)
        {
            return NotFound(ApiResponse<object>.Fail("Detail resep tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        detail.DeletedAt = DateTime.UtcNow;
        detail.Status = "4";
        var newTotal = await _dbContext.ResepDetail.Where(x => x.IdResep == header.Id && x.DeletedAt == null && x.Id != detail.Id).SumAsync(x => (decimal?)x.Total) ?? 0m;
        header.Total = newTotal;
        header.InputBy = userId.Value;
        header.Status = newTotal == 0 ? "4" : "1";

        await _dbContext.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { HeaderId = header.Id, DetailId = detail.Id, TotalBaru = header.Total, header.Status }, "Detail resep berhasil di-void.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("{idRegistrasi}/alkes/{detailId:long}")]
    public async Task<IActionResult> VoidAlkesDetail(string idRegistrasi, long detailId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var header = await _dbContext.AlkesPelayanan.Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Header alkes tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var detail = await _dbContext.AlkesDetail.FirstOrDefaultAsync(x => x.Id == detailId && x.IdAlkes == header.Id && x.DeletedAt == null);
        if (detail == null)
        {
            return NotFound(ApiResponse<object>.Fail("Detail alkes tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        detail.DeletedAt = DateTime.UtcNow;
        detail.Status = "4";
        var newTotal = await _dbContext.AlkesDetail.Where(x => x.IdAlkes == header.Id && x.DeletedAt == null && x.Id != detail.Id).SumAsync(x => (decimal?)x.Total) ?? 0m;
        header.Total = newTotal;
        header.InputBy = userId.Value;
        header.Status = newTotal == 0 ? "4" : "1";

        await _dbContext.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { HeaderId = header.Id, DetailId = detail.Id, TotalBaru = header.Total, header.Status }, "Detail alkes berhasil di-void.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("{idRegistrasi}/laboratorium/{detailId:long}")]
    public async Task<IActionResult> VoidLaboratoriumDetail(string idRegistrasi, long detailId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var header = await _dbContext.Laboratorium.Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Header laboratorium tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var detail = await _dbContext.LaboratoriumDetail.FirstOrDefaultAsync(x => x.Id == detailId && x.IdLaboratorium == header.Id && x.DeletedAt == null);
        if (detail == null)
        {
            return NotFound(ApiResponse<object>.Fail("Detail laboratorium tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        detail.DeletedAt = DateTime.UtcNow;
        detail.Status = "4";
        var newTotal = await _dbContext.LaboratoriumDetail.Where(x => x.IdLaboratorium == header.Id && x.DeletedAt == null && x.Id != detail.Id).SumAsync(x => (decimal?)x.Total) ?? 0m;
        header.Total = newTotal;
        header.InputBy = userId.Value;
        header.Status = newTotal == 0 ? "4" : "1";

        await _dbContext.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { HeaderId = header.Id, DetailId = detail.Id, TotalBaru = header.Total, header.Status }, "Detail laboratorium berhasil di-void.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("{idRegistrasi}/radiologi/{detailId:long}")]
    public async Task<IActionResult> VoidRadiologiDetail(string idRegistrasi, long detailId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var header = await _dbContext.Radiologi.Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Header radiologi tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var detail = await _dbContext.RadiologiDetail.FirstOrDefaultAsync(x => x.Id == detailId && x.IdRadiologi == header.Id && x.DeletedAt == null);
        if (detail == null)
        {
            return NotFound(ApiResponse<object>.Fail("Detail radiologi tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        detail.DeletedAt = DateTime.UtcNow;
        detail.Status = "4";
        var newTotal = await _dbContext.RadiologiDetail.Where(x => x.IdRadiologi == header.Id && x.DeletedAt == null && x.Id != detail.Id).SumAsync(x => (decimal?)x.Total) ?? 0m;
        header.Total = newTotal;
        header.InputBy = userId.Value;
        header.Status = newTotal == 0 ? "4" : "1";

        await _dbContext.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { HeaderId = header.Id, DetailId = detail.Id, TotalBaru = header.Total, header.Status }, "Detail radiologi berhasil di-void.", HttpContext.TraceIdentifier));
    }

    [HttpPut("{idRegistrasi}/tindakan/{tindakanId:long}")]
    public async Task<IActionResult> UpdateTindakan(string idRegistrasi, long tindakanId, [FromBody] UpdateTindakanRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Item tindakan wajib diisi.", HttpContext.TraceIdentifier));
        }

        var header = await _dbContext.Tindakan
            .FirstOrDefaultAsync(x => x.Id == tindakanId && x.IdRegistrasi == idRegistrasi && x.DeletedAt == null);
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Header tindakan tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        if (header.Status == "3" || header.Status == "4")
        {
            return BadRequest(ApiResponse<object>.Fail("Tindakan sudah selesai/void, tidak bisa diubah.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        var existingDetails = await _dbContext.TindakanDetail
            .Where(x => x.IdTindakan == header.Id && x.DeletedAt == null)
            .ToListAsync();

        var incomingIds = request.Items
            .Where(x => x.Id.HasValue)
            .Select(x => x.Id!.Value)
            .ToHashSet();

        foreach (var detail in existingDetails.Where(x => !incomingIds.Contains(x.Id)))
        {
            detail.DeletedAt = DateTime.UtcNow;
            detail.Status = "4";
        }

        foreach (var item in request.Items)
        {
            if (item.Id.HasValue)
            {
                var detail = existingDetails.FirstOrDefault(x => x.Id == item.Id.Value);
                if (detail == null)
                {
                    return NotFound(ApiResponse<object>.Fail($"Detail tindakan id {item.Id.Value} tidak ditemukan.", HttpContext.TraceIdentifier));
                }

                detail.IdJasa = item.IdJasa;
                detail.Harga = item.Harga;
                detail.Jumlah = item.Jumlah;
                detail.Total = item.Harga * item.Jumlah;
                detail.Status = "1";
            }
            else
            {
                _dbContext.TindakanDetail.Add(new Domain.Entities.TindakanDetailEntity
                {
                    IdTindakan = header.Id,
                    IdJasa = item.IdJasa,
                    Harga = item.Harga,
                    Jumlah = item.Jumlah,
                    Total = item.Harga * item.Jumlah,
                    Status = "1"
                });
            }
        }

        await _dbContext.SaveChangesAsync();

        var newTotal = await _dbContext.TindakanDetail
            .Where(x => x.IdTindakan == header.Id && x.DeletedAt == null)
            .SumAsync(x => (decimal?)x.Total) ?? 0m;

        header.Total = newTotal;
        header.InputBy = userId.Value;
        header.Status = newTotal == 0 ? "4" : "1";

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            header.Id,
            header.IdTransaksi,
            header.Total,
            header.Status
        }, "Tindakan berhasil diperbarui.", HttpContext.TraceIdentifier));
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

    private async Task<string> GenerateTindakanCodeAsync()
    {
        var total = await _dbContext.Tindakan.CountAsync();
        var sequence = total + 1;
        return "TR" + sequence.ToString().PadLeft(8, '0');
    }

    private async Task<string> GenerateResepCodeAsync()
    {
        var total = await _dbContext.Resep.CountAsync();
        var sequence = total + 1;
        return "RE" + sequence.ToString().PadLeft(8, '0');
    }

    private async Task<string> GenerateAlkesCodeAsync()
    {
        var total = await _dbContext.AlkesPelayanan.CountAsync();
        var sequence = total + 1;
        return "AK" + sequence.ToString().PadLeft(8, '0');
    }

    private async Task<string> GenerateLaboratoriumCodeAsync()
    {
        var total = await _dbContext.Laboratorium.CountAsync();
        var sequence = total + 1;
        return "LB" + sequence.ToString().PadLeft(8, '0');
    }

    private async Task<string> GenerateRadiologiCodeAsync()
    {
        var total = await _dbContext.Radiologi.CountAsync();
        var sequence = total + 1;
        return "RD" + sequence.ToString().PadLeft(8, '0');
    }
}

public class CreateTindakanRequest
{
    [Required]
    public List<CreateTindakanItemRequest> Items { get; set; } = new();
}

public class CreateTindakanItemRequest
{
    [Required]
    public long IdJasa { get; set; }

    [Range(0, 1000000000)]
    public decimal Harga { get; set; }

    [Range(1, 10000)]
    public int Jumlah { get; set; }
}

public class UpdateTindakanRequest
{
    [Required]
    public List<UpdateTindakanItemRequest> Items { get; set; } = new();
}

public class UpdateTindakanItemRequest
{
    public long? Id { get; set; }

    [Required]
    public long IdJasa { get; set; }

    [Range(0, 1000000000)]
    public decimal Harga { get; set; }

    [Range(1, 10000)]
    public int Jumlah { get; set; }
}

public class CreateResepRequest
{
    [MaxLength(255)]
    public string? Racikan { get; set; }

    [Required]
    public List<CreateResepItemRequest> Items { get; set; } = new();
}

public class CreateResepItemRequest
{
    [MaxLength(100)]
    public string? IdBarang { get; set; }

    [Required]
    [MaxLength(255)]
    public string NamaObat { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? AturanPakai { get; set; }

    [Range(1, 10000)]
    public int Jumlah { get; set; }

    [Range(0, 1000000000)]
    public decimal Harga { get; set; }
}

public class CreateAlkesRequest
{
    [Required]
    public List<CreateAlkesItemRequest> Items { get; set; } = new();
}

public class CreateAlkesItemRequest
{
    [MaxLength(100)]
    public string? KodeBarang { get; set; }

    [Required]
    [MaxLength(255)]
    public string NamaBarang { get; set; } = string.Empty;

    [Range(1, 10000)]
    public int Jumlah { get; set; }

    [Range(0, 1000000000)]
    public decimal Harga { get; set; }
}

public class CreateLaboratoriumRequest
{
    [Required]
    public List<CreateLaboratoriumItemRequest> Items { get; set; } = new();
}

public class CreateLaboratoriumItemRequest
{
    [MaxLength(100)]
    public string? KodePemeriksaan { get; set; }

    [Required]
    [MaxLength(255)]
    public string NamaPemeriksaan { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Hasil { get; set; }

    [Range(1, 10000)]
    public int Jumlah { get; set; }

    [Range(0, 1000000000)]
    public decimal Harga { get; set; }
}

public class CreateRadiologiRequest
{
    [Required]
    public List<CreateRadiologiItemRequest> Items { get; set; } = new();
}

public class CreateRadiologiItemRequest
{
    [MaxLength(100)]
    public string? KodePemeriksaan { get; set; }

    [Required]
    [MaxLength(255)]
    public string NamaPemeriksaan { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Hasil { get; set; }

    [Range(1, 10000)]
    public int Jumlah { get; set; }

    [Range(0, 1000000000)]
    public decimal Harga { get; set; }
}
