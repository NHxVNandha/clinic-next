using ClinicNext.Api.Data;
using ClinicNext.Api.Domain.Entities;
using ClinicNext.Api.Models.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicNext.Api.Features.RekamMedis;

[ApiController]
[Authorize]
[Route("api/v1/rekam-medis")]
public class RekamMedisController : ControllerBase
{
    private readonly ClinicDbContext _dbContext;

    public RekamMedisController(ClinicDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("forms")]
    public IActionResult Forms()
    {
        return Ok(ApiResponse<object>.Ok(new[]
        {
            "surat-keterangan-sakit",
            "surat-keterangan-sehat",
            "surat-konsultasi",
            "surat-jawaban-konsultasi",
            "surat-permintaan-dirawat",
            "surat-permintaan-tindakan",
            "surat-permintaan-odc",
            "surat-kontrol",
            "surat-persetujuan-tindakan-kedokteran",
            "surat-penolakan-tindakan-kedokteran",
            "surat-ringkasan-pasien-pulang",
            "asesmen-medis-rawat-jalan",
            "asesmen-medis-gigi-rawat-jalan",
            "catatan-perkembangan-pasien-terintegrasi",
            "blank-rekam-medis"
        }, "Daftar form rekam medis berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("history")]
    public async Task<IActionResult> History([FromQuery] string? idPasien = null, [FromQuery] string? idRegistrasi = null)
    {
        var query = _dbContext.RekamMedisHistory.Where(x => x.DeletedAt == null).AsQueryable();

        if (!string.IsNullOrWhiteSpace(idPasien))
        {
            query = query.Where(x => x.IdPasien == idPasien);
        }
        if (!string.IsNullOrWhiteSpace(idRegistrasi))
        {
            query = query.Where(x => x.IdRegistrasi == idRegistrasi);
        }

        var data = await query.OrderByDescending(x => x.Id).ToListAsync();
        return Ok(ApiResponse<object>.Ok(data, "Histori rekam medis berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{formKey}")]
    public async Task<IActionResult> ListByForm(string formKey, [FromQuery] string? idPasien = null, [FromQuery] string? idRegistrasi = null)
    {
        if (formKey == "blank-rekam-medis")
        {
            var q = _dbContext.BlankRekamMedis.Where(x => x.DeletedAt == null).OrderByDescending(x => x.Id);
            return Ok(ApiResponse<object>.Ok(await q.ToListAsync(), "Data blank rekam medis berhasil diambil.", HttpContext.TraceIdentifier));
        }

        var query = ResolveFormQuery(formKey);
        if (query == null)
        {
            return NotFound(ApiResponse<object>.Fail("Form rekam medis tidak dikenal.", HttpContext.TraceIdentifier));
        }

        if (!string.IsNullOrWhiteSpace(idPasien))
        {
            query = query.Where(x => x.IdPasien == idPasien);
        }
        if (!string.IsNullOrWhiteSpace(idRegistrasi))
        {
            query = query.Where(x => x.IdRegistrasi == idRegistrasi);
        }

        var data = await query.OrderByDescending(x => x.Id).ToListAsync();
        return Ok(ApiResponse<object>.Ok(data, "Data rekam medis berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpGet("{formKey}/{id:long}")]
    public async Task<IActionResult> DetailByForm(string formKey, long id)
    {
        if (formKey == "blank-rekam-medis")
        {
            var dataBlank = await _dbContext.BlankRekamMedis.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
            if (dataBlank == null)
            {
                return NotFound(ApiResponse<object>.Fail("Data tidak ditemukan.", HttpContext.TraceIdentifier));
            }
            return Ok(ApiResponse<object>.Ok(dataBlank, "Detail blank rekam medis berhasil diambil.", HttpContext.TraceIdentifier));
        }

        var query = ResolveFormQuery(formKey);
        if (query == null)
        {
            return NotFound(ApiResponse<object>.Fail("Form rekam medis tidak dikenal.", HttpContext.TraceIdentifier));
        }

        var data = await query.FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);
        if (data == null)
        {
            return NotFound(ApiResponse<object>.Fail("Data tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<object>.Ok(data, "Detail rekam medis berhasil diambil.", HttpContext.TraceIdentifier));
    }

    private IQueryable<MrSuratBaseEntity>? ResolveFormQuery(string formKey)
    {
        return formKey switch
        {
            "surat-keterangan-sakit" => _dbContext.SuratKeteranganSakit.Cast<MrSuratBaseEntity>(),
            "surat-keterangan-sehat" => _dbContext.SuratKeteranganSehat.Cast<MrSuratBaseEntity>(),
            "surat-konsultasi" => _dbContext.SuratKonsultasi.Cast<MrSuratBaseEntity>(),
            "surat-jawaban-konsultasi" => _dbContext.SuratJawabanKonsultasi.Cast<MrSuratBaseEntity>(),
            "surat-permintaan-dirawat" => _dbContext.SuratPermintaanDirawat.Cast<MrSuratBaseEntity>(),
            "surat-permintaan-tindakan" => _dbContext.SuratPermintaanTindakan.Cast<MrSuratBaseEntity>(),
            "surat-permintaan-odc" => _dbContext.SuratPermintaanODC.Cast<MrSuratBaseEntity>(),
            "surat-kontrol" => _dbContext.SuratKontrol.Cast<MrSuratBaseEntity>(),
            "surat-persetujuan-tindakan-kedokteran" => _dbContext.SuratPersetujuanTindakanKedokteran.Cast<MrSuratBaseEntity>(),
            "surat-penolakan-tindakan-kedokteran" => _dbContext.SuratPenolakanTindakanKedokteran.Cast<MrSuratBaseEntity>(),
            "surat-ringkasan-pasien-pulang" => _dbContext.SuratRingkasanPasienPulang.Cast<MrSuratBaseEntity>(),
            "asesmen-medis-rawat-jalan" => _dbContext.AsesmenMedisPasienRawatJalan.Cast<MrSuratBaseEntity>(),
            "asesmen-medis-gigi-rawat-jalan" => _dbContext.AsesmenMedisPasienSpesialisGigiRawatJalan.Cast<MrSuratBaseEntity>(),
            "catatan-perkembangan-pasien-terintegrasi" => _dbContext.CatatanPerkembanganPasienTerintegrasi.Cast<MrSuratBaseEntity>(),
            _ => null
        };
    }
}
