using ClinicNext.Api.Data;
using ClinicNext.Api.Models.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace ClinicNext.Api.Features.Laporan;

[ApiController]
[Authorize]
[Route("api/v1/laporan")]
public class LaporanController : ControllerBase
{
    private readonly ClinicDbContext _dbContext;

    public LaporanController(ClinicDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("tindakan")]
    public async Task<IActionResult> GetLaporanTindakan(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? kdDokter = null,
        [FromQuery] string? tanggal = null,
        [FromQuery] string? fromDate = null,
        [FromQuery] string? toDate = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query =
            from t in _dbContext.Tindakan
            join p in _dbContext.Pasien on t.IdPasien equals p.IdPasien into pasienJoin
            from p in pasienJoin.DefaultIfEmpty()
            join d in _dbContext.Dokter on t.KdDokter equals d.KdDokter into dokterJoin
            from d in dokterJoin.DefaultIfEmpty()
            where t.DeletedAt == null
            select new
            {
                t.Id,
                t.IdTransaksi,
                t.IdRegistrasi,
                t.IdPasien,
                NamaPasien = p != null ? p.Nama : null,
                p.Nik,
                t.KdDokter,
                NamaDokter = d != null ? d.NamaDokter : null,
                t.Tanggal,
                t.Total,
                t.Status
            };

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => (x.Status ?? string.Empty) == status);
        }

        if (!string.IsNullOrWhiteSpace(kdDokter))
        {
            query = query.Where(x => (x.KdDokter ?? string.Empty) == kdDokter);
        }

        if (!string.IsNullOrWhiteSpace(tanggal))
        {
            query = query.Where(x => (x.Tanggal ?? string.Empty) == tanggal);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                (x.IdTransaksi ?? string.Empty).Contains(search) ||
                (x.IdRegistrasi ?? string.Empty).Contains(search) ||
                (x.IdPasien ?? string.Empty).Contains(search) ||
                (x.NamaPasien ?? string.Empty).Contains(search) ||
                (x.Nik ?? string.Empty).Contains(search) ||
                (x.KdDokter ?? string.Empty).Contains(search) ||
                (x.NamaDokter ?? string.Empty).Contains(search));
        }

        var list = await query.OrderByDescending(x => x.Id).ToListAsync();
        list = FilterByDateRange(list, x => x.Tanggal, fromDate, toDate);

        var totalRows = list.Count;
        var totalNominal = list.Sum(x => x.Total ?? 0m);

        var items = list
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(ApiResponse<object>.Ok(new
        {
            Page = page,
            PageSize = pageSize,
            Total = totalRows,
            Items = items,
            Summary = new
            {
                TotalNominal = totalNominal
            }
        }, "Laporan tindakan berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("pembayaran")]
    public async Task<IActionResult> GetLaporanPembayaran(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? kdDokter = null,
        [FromQuery] string? tanggal = null,
        [FromQuery] string? fromDate = null,
        [FromQuery] string? toDate = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query =
            from pb in _dbContext.Pembayaran
            join p in _dbContext.Pasien on pb.IdPasien equals p.IdPasien into pasienJoin
            from p in pasienJoin.DefaultIfEmpty()
            join d in _dbContext.Dokter on pb.KdDokter equals d.KdDokter into dokterJoin
            from d in dokterJoin.DefaultIfEmpty()
            where pb.DeletedAt == null
            select new
            {
                pb.Id,
                pb.NoInvoice,
                pb.IdRegistrasi,
                pb.IdPasien,
                NamaPasien = p != null ? p.Nama : null,
                p.Nik,
                pb.KdDokter,
                NamaDokter = d != null ? d.NamaDokter : null,
                pb.TglBayar,
                pb.Total,
                pb.Grandtotal,
                pb.JumlahBayar,
                pb.Sisa,
                pb.Status
            };

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => (x.Status ?? string.Empty) == status);
        }

        if (!string.IsNullOrWhiteSpace(kdDokter))
        {
            query = query.Where(x => (x.KdDokter ?? string.Empty) == kdDokter);
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
                (x.Nik ?? string.Empty).Contains(search) ||
                (x.KdDokter ?? string.Empty).Contains(search) ||
                (x.NamaDokter ?? string.Empty).Contains(search));
        }

        var list = await query.OrderByDescending(x => x.Id).ToListAsync();
        list = FilterByDateRange(list, x => x.TglBayar, fromDate, toDate);

        var totalRows = list.Count;
        var totalGrand = list.Sum(x => x.Grandtotal ?? 0m);
        var totalBayar = list.Sum(x => x.JumlahBayar ?? 0m);
        var totalSisa = list.Sum(x => x.Sisa ?? 0m);

        var items = list
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(ApiResponse<object>.Ok(new
        {
            Page = page,
            PageSize = pageSize,
            Total = totalRows,
            Items = items,
            Summary = new
            {
                TotalGrand = totalGrand,
                TotalBayar = totalBayar,
                TotalSisa = totalSisa
            }
        }, "Laporan pembayaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("pendaftaran")]
    public async Task<IActionResult> GetLaporanPendaftaran(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? kdDokter = null,
        [FromQuery] string? tanggal = null,
        [FromQuery] string? fromDate = null,
        [FromQuery] string? toDate = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("page dan pageSize harus lebih dari 0.", HttpContext.TraceIdentifier));
        }

        var query =
            from reg in _dbContext.Pendaftaran
            join p in _dbContext.Pasien on reg.IdPasien equals p.Id
            join d in _dbContext.Dokter on reg.KdDokter equals d.KdDokter into dokterJoin
            from d in dokterJoin.DefaultIfEmpty()
            where reg.DeletedAt == null && p.DeletedAt == null
            select new
            {
                reg.Id,
                reg.IdRegistrasi,
                reg.Tanggal,
                reg.Status,
                reg.KdDokter,
                p.IdPasien,
                p.Nik,
                NamaPasien = p.Nama,
                NamaDokter = d != null ? d.NamaDokter : null
            };

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => (x.Status ?? string.Empty) == status);
        }

        if (!string.IsNullOrWhiteSpace(kdDokter))
        {
            query = query.Where(x => (x.KdDokter ?? string.Empty) == kdDokter);
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
                (x.NamaDokter ?? string.Empty).Contains(search));
        }

        var list = await query.OrderByDescending(x => x.Id).ToListAsync();
        list = FilterByDateRange(list, x => x.Tanggal, fromDate, toDate);

        var totalRows = list.Count;
        var summary = new
        {
            TotalAktif = list.Count(x => x.Status == "1" || x.Status == "2"),
            TotalSelesai = list.Count(x => x.Status == "3"),
            TotalVoid = list.Count(x => x.Status == "4")
        };

        var items = list
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(ApiResponse<object>.Ok(new
        {
            Page = page,
            PageSize = pageSize,
            Total = totalRows,
            Items = items,
            Summary = summary
        }, "Laporan pendaftaran berhasil diambil.", HttpContext.TraceIdentifier));
    }

    private static List<T> FilterByDateRange<T>(List<T> data, Func<T, string?> dateSelector, string? fromDate, string? toDate)
    {
        var from = ParseFlexibleDate(fromDate);
        var to = ParseFlexibleDate(toDate);

        if (from == null && to == null)
        {
            return data;
        }

        return data.Where(item =>
        {
            var date = ParseFlexibleDate(dateSelector(item));
            if (date == null)
            {
                return false;
            }

            if (from != null && date.Value.Date < from.Value.Date)
            {
                return false;
            }

            if (to != null && date.Value.Date > to.Value.Date)
            {
                return false;
            }

            return true;
        }).ToList();
    }

    private static DateTime? ParseFlexibleDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var formats = new[] { "dd-MM-yyyy", "yyyy-MM-dd", "dd/MM/yyyy", "yyyy/MM/dd" };
        if (DateTime.TryParseExact(value, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
        {
            return parsed;
        }

        if (DateTime.TryParse(value, out parsed))
        {
            return parsed;
        }

        return null;
    }
}
