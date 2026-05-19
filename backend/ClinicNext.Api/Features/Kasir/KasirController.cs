using ClinicNext.Api.Data;
using ClinicNext.Api.Domain.Entities;
using ClinicNext.Api.Models.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClinicNext.Api.Features.Kasir;

[ApiController]
[Authorize]
[Route("api/v1/kasir")]
public class KasirController : ControllerBase
{
    private readonly ClinicDbContext _dbContext;

    public KasirController(ClinicDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("pembayaran")]
    public async Task<IActionResult> GetPembayaran(
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
            from p in _dbContext.Pembayaran
            join ps in _dbContext.Pasien on p.IdPasien equals ps.IdPasien into pasienJoin
            from ps in pasienJoin.DefaultIfEmpty()
            join d in _dbContext.Dokter on p.KdDokter equals d.KdDokter into dokterJoin
            from d in dokterJoin.DefaultIfEmpty()
            where p.DeletedAt == null
            select new
            {
                p.Id,
                p.NoInvoice,
                p.IdRegistrasi,
                p.IdPasien,
                NamaPasien = ps != null ? ps.Nama : null,
                p.KdDokter,
                NamaDokter = d != null ? d.NamaDokter : null,
                p.Total,
                p.Grandtotal,
                p.JumlahBayar,
                p.Sisa,
                p.Status,
                p.TglBayar
            };

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => (x.Status ?? string.Empty) == status);
        }

        if (!string.IsNullOrWhiteSpace(tanggal))
        {
            query = query.Where(x => (x.TglBayar ?? string.Empty) == tanggal);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.NoInvoice ?? string.Empty).Contains(search) ||
                (x.IdRegistrasi ?? string.Empty).Contains(search) ||
                (x.IdPasien ?? string.Empty).Contains(search) ||
                (x.NamaPasien ?? string.Empty).Contains(search) ||
                (x.KdDokter ?? string.Empty).Contains(search) ||
                (x.NamaDokter ?? string.Empty).Contains(search));
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
        }, "Data pembayaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("pembayaran/{id:long}")]
    public async Task<IActionResult> GetPembayaranDetail(long id)
    {
        var header = await (
            from p in _dbContext.Pembayaran
            join ps in _dbContext.Pasien on p.IdPasien equals ps.IdPasien into pasienJoin
            from ps in pasienJoin.DefaultIfEmpty()
            join d in _dbContext.Dokter on p.KdDokter equals d.KdDokter into dokterJoin
            from d in dokterJoin.DefaultIfEmpty()
            where p.DeletedAt == null && p.Id == id
            select new
            {
                p.Id,
                p.NoInvoice,
                p.IdRegistrasi,
                p.IdPasien,
                NamaPasien = ps != null ? ps.Nama : null,
                p.KdDokter,
                NamaDokter = d != null ? d.NamaDokter : null,
                p.Total,
                p.BAdmin,
                p.BTambahan,
                p.BOngkir,
                p.Diskon,
                p.Grandtotal,
                p.JumlahBayar,
                p.Sisa,
                p.Status,
                p.TglBayar
            }).FirstOrDefaultAsync();

        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pembayaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var tindakan = await _dbContext.Tindakan
            .Where(x => x.IdRegistrasi == header.IdRegistrasi && x.DeletedAt == null)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        var items = new List<object>();
        if (tindakan != null)
        {
            items = await (
                from td in _dbContext.TindakanDetail
                join j in _dbContext.Jasa on td.IdJasa equals j.Id
                where td.IdTindakan == tindakan.Id && td.DeletedAt == null
                select new
                {
                    td.Id,
                    td.IdJasa,
                    NamaJasa = j.NamaJasa,
                    td.Harga,
                    td.Jumlah,
                    td.Total
                }).Cast<object>().ToListAsync();
        }

        return Ok(ApiResponse<object>.Ok(new
        {
            Header = header,
            Items = items
        }, "Detail pembayaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("invoice-preview/{idRegistrasi}")]
    public async Task<IActionResult> GetInvoicePreview(string idRegistrasi)
    {
        var tindakan = await _dbContext.Tindakan
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (tindakan == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data tindakan tidak ditemukan untuk registrasi ini.", HttpContext.TraceIdentifier));
        }

        var pendaftaran = await _dbContext.Pendaftaran
            .Where(x => x.IdRegistrasi == idRegistrasi && x.DeletedAt == null)
            .FirstOrDefaultAsync();

        var pasien = pendaftaran == null
            ? null
            : await _dbContext.Pasien.FirstOrDefaultAsync(x => x.Id == pendaftaran.IdPasien && x.DeletedAt == null);

        var dokter = string.IsNullOrWhiteSpace(tindakan.KdDokter)
            ? null
            : await _dbContext.Dokter.FirstOrDefaultAsync(x => x.KdDokter == tindakan.KdDokter && x.DeletedAt == null);

        var items = await (
            from td in _dbContext.TindakanDetail
            join j in _dbContext.Jasa on td.IdJasa equals j.Id
            where td.IdTindakan == tindakan.Id && td.DeletedAt == null
            orderby td.Id
            select new
            {
                td.Id,
                td.IdJasa,
                NamaJasa = j.NamaJasa,
                td.Harga,
                td.Jumlah,
                td.Total
            }).ToListAsync();

        var total = items.Sum(x => x.Total);

        return Ok(ApiResponse<object>.Ok(new
        {
            Header = new
            {
                tindakan.Id,
                tindakan.IdTransaksi,
                tindakan.IdRegistrasi,
                tindakan.Tanggal,
                Pasien = pasien == null ? null : new { pasien.IdPasien, pasien.Nik, pasien.Nama },
                Dokter = dokter == null ? null : new { dokter.KdDokter, dokter.NamaDokter }
            },
            Items = items,
            Summary = new
            {
                Total = total
            }
        }, "Preview invoice berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("pembayaran")]
    public async Task<IActionResult> CreatePembayaran([FromBody] CreatePembayaranRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var existing = await _dbContext.Pembayaran
            .AnyAsync(x => x.IdRegistrasi == request.IdRegistrasi && x.DeletedAt == null);
        if (existing)
        {
            return Conflict(ApiResponse<object>.Fail("Registrasi sudah memiliki pembayaran.", HttpContext.TraceIdentifier));
        }

        var pendaftaran = await _dbContext.Pendaftaran
            .FirstOrDefaultAsync(x => x.IdRegistrasi == request.IdRegistrasi && x.DeletedAt == null);
        if (pendaftaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pendaftaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var tindakanTotal = await _dbContext.Tindakan
            .Where(x => x.IdRegistrasi == request.IdRegistrasi && x.DeletedAt == null)
            .SumAsync(x => (decimal?)x.Total) ?? 0m;

        var subtotal = request.Total ?? tindakanTotal;
        var grandTotal = subtotal + request.BAdmin + request.BTambahan + request.BOngkir - request.Diskon;
        var jumlahBayar = request.JumlahBayar;
        var sisa = grandTotal - jumlahBayar;

        if (sisa < 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Jumlah bayar melebihi grand total.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        var pembayaran = new PembayaranEntity
        {
            IdRegistrasi = request.IdRegistrasi,
            IdPasien = request.IdPasien,
            KdDokter = request.KdDokter,
            NoInvoice = await GenerateInvoiceNumberAsync(),
            Total = subtotal,
            BAdmin = request.BAdmin,
            BTambahan = request.BTambahan,
            BOngkir = request.BOngkir,
            Diskon = request.Diskon,
            Grandtotal = grandTotal,
            JumlahBayar = jumlahBayar,
            Sisa = sisa,
            Status = sisa == 0 ? "1" : "2",
            TglBayar = DateTime.Now.ToString("dd-MM-yyyy"),
            InputBy = userId.Value
        };

        _dbContext.Pembayaran.Add(pembayaran);

        pendaftaran.Status = sisa == 0 ? "3" : "2";
        pendaftaran.InputBy = userId.Value;

        await _dbContext.Tindakan
            .Where(x => x.IdRegistrasi == request.IdRegistrasi && x.DeletedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, sisa == 0 ? "3" : "2")
                .SetProperty(x => x.InputBy, userId.Value));

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            pembayaran.Id,
            pembayaran.NoInvoice,
            pembayaran.Status,
            pembayaran.Sisa
        }, "Pembayaran berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpPost("pembayaran/{id:long}/bayar-sisa")]
    public async Task<IActionResult> BayarSisa(long id, [FromBody] BayarSisaRequest request)
    {
        if (request.Bayar <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Nominal bayar harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var pembayaran = await _dbContext.Pembayaran
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (pembayaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pembayaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var currentPaid = pembayaran.JumlahBayar ?? 0m;
        var grandTotal = pembayaran.Grandtotal ?? 0m;
        var newPaid = currentPaid + request.Bayar;
        if (newPaid > grandTotal)
        {
            return BadRequest(ApiResponse<object>.Fail("Pembayaran melebihi grand total.", HttpContext.TraceIdentifier));
        }

        var newSisa = grandTotal - newPaid;

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        pembayaran.JumlahBayar = newPaid;
        pembayaran.Sisa = newSisa;
        pembayaran.Status = newSisa == 0 ? "1" : "2";
        pembayaran.InputBy = userId.Value;

        await _dbContext.Pendaftaran
            .Where(x => x.IdRegistrasi == pembayaran.IdRegistrasi && x.DeletedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, newSisa == 0 ? "3" : "2")
                .SetProperty(x => x.InputBy, userId.Value));

        await _dbContext.Tindakan
            .Where(x => x.IdRegistrasi == pembayaran.IdRegistrasi && x.DeletedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, newSisa == 0 ? "3" : "2")
                .SetProperty(x => x.InputBy, userId.Value));

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            pembayaran.Id,
            pembayaran.NoInvoice,
            pembayaran.JumlahBayar,
            pembayaran.Sisa,
            pembayaran.Status
        }, "Pembayaran berhasil diperbarui.", HttpContext.TraceIdentifier));
    }

    [HttpPost("pembayaran/{id:long}/void")]
    public async Task<IActionResult> VoidPembayaran(long id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var pembayaran = await _dbContext.Pembayaran
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (pembayaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pembayaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        pembayaran.Status = "4";
        pembayaran.InputBy = userId.Value;

        await _dbContext.Pendaftaran
            .Where(x => x.IdRegistrasi == pembayaran.IdRegistrasi && x.DeletedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, "2")
                .SetProperty(x => x.InputBy, userId.Value));

        await _dbContext.Tindakan
            .Where(x => x.IdRegistrasi == pembayaran.IdRegistrasi && x.DeletedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, "2")
                .SetProperty(x => x.InputBy, userId.Value));

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            pembayaran.Id,
            pembayaran.NoInvoice,
            pembayaran.Status
        }, "Pembayaran berhasil di-void.", HttpContext.TraceIdentifier));
    }

    [HttpGet("pembayaran/{id:long}/detail-item")]
    public async Task<IActionResult> GetPembayaranDetailItems(long id)
    {
        var exists = await _dbContext.Pembayaran.AnyAsync(x => x.Id == id && x.DeletedAt == null);
        if (!exists)
        {
            return NotFound(ApiResponse<object>.Fail("Data pembayaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var data = await _dbContext.PembayaranDetail
            .Where(x => x.IdPembayaran == id && x.DeletedAt == null)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(data, "Detail item pembayaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("pembayaran/{id:long}/detail-item")]
    public async Task<IActionResult> AddPembayaranDetailItem(long id, [FromBody] AddPembayaranDetailItemRequest request)
    {
        var pembayaran = await _dbContext.Pembayaran.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (pembayaran == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pembayaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var detail = new PembayaranDetailEntity
        {
            IdPembayaran = id,
            KodeItem = request.KodeItem,
            Item = request.Item,
            Nominal = request.Nominal
        };

        _dbContext.PembayaranDetail.Add(detail);
        pembayaran.Grandtotal = (pembayaran.Grandtotal ?? 0m) + request.Nominal;
        pembayaran.Sisa = (pembayaran.Grandtotal ?? 0m) - (pembayaran.JumlahBayar ?? 0m);
        pembayaran.Status = (pembayaran.Sisa ?? 0m) == 0m ? "1" : "2";

        await _dbContext.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { detail.Id }, "Item pembayaran berhasil ditambahkan.", HttpContext.TraceIdentifier));
    }

    [HttpGet("pengeluaran")]
    public async Task<IActionResult> GetPengeluaran([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query = _dbContext.Pengeluaran.Where(x => x.DeletedAt == null);
        var total = await query.CountAsync();
        var data = await query.OrderByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(ApiResponse<object>.Ok(new { Page = page, PageSize = pageSize, Total = total, Items = data }, "Data pengeluaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("pengeluaran/{id:long}")]
    public async Task<IActionResult> GetPengeluaranDetail(long id)
    {
        var header = await _dbContext.Pengeluaran.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pengeluaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var details = await _dbContext.PengeluaranDetail
            .Where(x => x.PengeluaranId == id && x.DeletedAt == null)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new { Header = header, Details = details }, "Detail pengeluaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("pengeluaran")]
    public async Task<IActionResult> CreatePengeluaran([FromBody] UpsertPengeluaranRequest request)
    {
        var userName = User.FindFirstValue("name") ?? "system";
        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Item pengeluaran wajib diisi.", HttpContext.TraceIdentifier));
        }

        var grandTotal = request.Items.Sum(x => x.Biaya * x.Jumlah);
        var kode = await GeneratePengeluaranCodeAsync();

        using var trx = await _dbContext.Database.BeginTransactionAsync();

        var header = new PengeluaranEntity
        {
            KodePengeluaran = kode,
            Tanggal = request.Tanggal,
            Keterangan = request.Keterangan,
            GrandTotal = grandTotal,
            File = request.File,
            IsAktif = request.IsAktif,
            InputBy = userName
        };

        _dbContext.Pengeluaran.Add(header);
        await _dbContext.SaveChangesAsync();

        foreach (var item in request.Items)
        {
            _dbContext.PengeluaranDetail.Add(new PengeluaranDetailEntity
            {
                PengeluaranId = header.Id,
                Nama = item.Nama,
                Jumlah = item.Jumlah,
                Biaya = item.Biaya,
                SubTotal = item.Biaya * item.Jumlah
            });
        }

        await _dbContext.SaveChangesAsync();
        await trx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new { header.Id, header.KodePengeluaran, header.GrandTotal }, "Pengeluaran berhasil disimpan.", HttpContext.TraceIdentifier));
    }

    [HttpDelete("pengeluaran/{id:long}/detail/{detailId:long}")]
    public async Task<IActionResult> DeletePengeluaranDetail(long id, long detailId)
    {
        var header = await _dbContext.Pengeluaran.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data pengeluaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        var detail = await _dbContext.PengeluaranDetail.FirstOrDefaultAsync(x => x.Id == detailId && x.PengeluaranId == id && x.DeletedAt == null);
        if (detail == null)
        {
            return NotFound(ApiResponse<object>.Fail("Detail pengeluaran tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        detail.DeletedAt = DateTime.UtcNow;
        header.GrandTotal = (header.GrandTotal ?? 0m) - detail.SubTotal;
        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { header.Id, header.GrandTotal }, "Detail pengeluaran berhasil dihapus.", HttpContext.TraceIdentifier));
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

    private async Task<string> GenerateInvoiceNumberAsync()
    {
        var monthRoman = new[] { "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII" };
        var year = DateTime.Now.Year;
        var count = await _dbContext.Pembayaran.CountAsync() + 1;
        return $"KWT/{count.ToString().PadLeft(5, '0')}/{monthRoman[DateTime.Now.Month]}/{year}";
    }

    private async Task<string> GeneratePengeluaranCodeAsync()
    {
        var count = await _dbContext.Pengeluaran.CountAsync() + 1;
        return "PL" + count.ToString().PadLeft(8, '0');
    }
}

public class CreatePembayaranRequest
{
    [Required]
    [MaxLength(50)]
    public string IdRegistrasi { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string IdPasien { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string KdDokter { get; set; } = string.Empty;

    [Range(0, 1000000000)]
    public decimal? Total { get; set; }

    [Range(0, 1000000000)]
    public decimal BAdmin { get; set; }

    [Range(0, 1000000000)]
    public decimal BTambahan { get; set; }

    [Range(0, 1000000000)]
    public decimal BOngkir { get; set; }

    [Range(0, 1000000000)]
    public decimal Diskon { get; set; }

    [Range(0, 1000000000)]
    public decimal JumlahBayar { get; set; }
}

public class BayarSisaRequest
{
    [Range(1, 1000000000)]
    public decimal Bayar { get; set; }
}

public class AddPembayaranDetailItemRequest
{
    [MaxLength(50)]
    public string? KodeItem { get; set; }

    [Required]
    [MaxLength(255)]
    public string Item { get; set; } = string.Empty;

    [Range(0, 1000000000)]
    public decimal Nominal { get; set; }
}

public class UpsertPengeluaranRequest
{
    [Required]
    [MaxLength(20)]
    public string Tanggal { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Keterangan { get; set; }

    [MaxLength(255)]
    public string? File { get; set; }

    public int? IsAktif { get; set; } = 1;

    [Required]
    public List<UpsertPengeluaranItemRequest> Items { get; set; } = new();
}

public class UpsertPengeluaranItemRequest
{
    [Required]
    [MaxLength(255)]
    public string Nama { get; set; } = string.Empty;

    [Range(1, 1000000)]
    public int Jumlah { get; set; }

    [Range(0, 1000000000)]
    public decimal Biaya { get; set; }
}
