using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using ClinicNext.Api.Data;
using ClinicNext.Api.Domain.Entities;
using ClinicNext.Api.Models.Common;
using ClinicNext.Api.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ClinicNext.Api.Features.Auth;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly ClinicDbContext _dbContext;
    private readonly JwtOptions _jwtOptions;

    public AuthController(ClinicDbContext dbContext, IOptions<JwtOptions> jwtOptions)
    {
        _dbContext = dbContext;
        _jwtOptions = jwtOptions.Value;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(ApiResponse<object>.Fail("Email dan password wajib diisi.", HttpContext.TraceIdentifier));
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == request.Email);
        if (user == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Email atau password tidak valid.", HttpContext.TraceIdentifier));
        }

        var hash = NormalizeBcryptHash(user.Password);
        var validPassword = BCrypt.Net.BCrypt.Verify(request.Password, hash);
        if (!validPassword)
        {
            return Unauthorized(ApiResponse<object>.Fail("Email atau password tidak valid.", HttpContext.TraceIdentifier));
        }

        var tokenPair = await IssueTokenPairAsync(user);

        return Ok(ApiResponse<LoginResponse>.Ok(new LoginResponse
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshToken,
            ExpiresAtUtc = tokenPair.ExpiresAtUtc,
            TokenType = "Bearer",
            User = new LoginUserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = ResolveRoleName(user),
                RoleId = user.RoleId
            }
        }, "Login berhasil.", HttpContext.TraceIdentifier));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!int.TryParse(sub, out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("User tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<LoginUserResponse>.Ok(new LoginUserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            RoleId = user.RoleId,
            Role = ResolveRoleName(user)
        }, "Profil user berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(ApiResponse<object>.Fail("Refresh token wajib diisi.", HttpContext.TraceIdentifier));
        }

        var now = DateTime.UtcNow;
        var incomingHash = HashToken(request.RefreshToken);

        var tokenEntity = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(x => x.TokenHash == incomingHash);

        if (tokenEntity == null || tokenEntity.RevokedAt != null || tokenEntity.ExpiresAt <= now)
        {
            return Unauthorized(ApiResponse<object>.Fail("Refresh token tidak valid atau kadaluarsa.", HttpContext.TraceIdentifier));
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == tokenEntity.UserId);
        if (user == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("User token tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        tokenEntity.RevokedAt = now;
        tokenEntity.UpdatedAt = now;

        var tokenPair = await IssueTokenPairAsync(user);

        return Ok(ApiResponse<LoginResponse>.Ok(new LoginResponse
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshToken,
            ExpiresAtUtc = tokenPair.ExpiresAtUtc,
            TokenType = "Bearer",
            User = new LoginUserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                RoleId = user.RoleId,
                Role = ResolveRoleName(user)
            }
        }, "Token berhasil diperbarui.", HttpContext.TraceIdentifier));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(ApiResponse<object>.Fail("Refresh token wajib diisi.", HttpContext.TraceIdentifier));
        }

        var tokenHash = HashToken(request.RefreshToken);
        var tokenEntity = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (tokenEntity != null && tokenEntity.RevokedAt == null)
        {
            tokenEntity.RevokedAt = DateTime.UtcNow;
            tokenEntity.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }

        return Ok(ApiResponse<object>.Ok(new { }, "Logout berhasil.", HttpContext.TraceIdentifier));
    }

    [Authorize]
    [HttpGet("sessions")]
    public async Task<IActionResult> Sessions()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var sessions = await _dbContext.RefreshTokens
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.DeviceName,
                x.UserAgent,
                x.IpAddress,
                x.CreatedAt,
                x.ExpiresAt,
                x.RevokedAt,
                IsActive = x.RevokedAt == null && x.ExpiresAt > DateTime.UtcNow
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(sessions, "Daftar session berhasil diambil.", HttpContext.TraceIdentifier));
    }

    [Authorize]
    [HttpPost("revoke-all")]
    public async Task<IActionResult> RevokeAll()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var now = DateTime.UtcNow;
        var updated = await _dbContext.RefreshTokens
            .Where(x => x.UserId == userId.Value && x.RevokedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.RevokedAt, now)
                .SetProperty(x => x.UpdatedAt, now));

        return Ok(ApiResponse<object>.Ok(new { Revoked = updated }, "Semua session berhasil direvoke.", HttpContext.TraceIdentifier));
    }

    private async Task<TokenPair> IssueTokenPairAsync(UserEntity user)
    {
        var roleName = ResolveRoleName(user);
        var now = DateTime.UtcNow;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("name", user.Name),
            new(ClaimTypes.Role, roleName)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var accessExpiresAt = now.AddMinutes(_jwtOptions.AccessTokenMinutes);

        var jwt = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: accessExpiresAt,
            signingCredentials: credentials);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(jwt);
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        var userAgent = Request.Headers.UserAgent.ToString();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var deviceName = ResolveDeviceName(userAgent);

        _dbContext.RefreshTokens.Add(new RefreshTokenEntity
        {
            UserId = user.Id,
            TokenHash = HashToken(refreshToken),
            ExpiresAt = now.AddDays(_jwtOptions.RefreshTokenDays),
            DeviceName = deviceName,
            UserAgent = string.IsNullOrWhiteSpace(userAgent) ? null : userAgent,
            IpAddress = ipAddress,
            CreatedAt = now,
            UpdatedAt = now
        });

        await _dbContext.SaveChangesAsync();

        return new TokenPair
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAtUtc = accessExpiresAt
        };
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }

    private static string NormalizeBcryptHash(string hash)
    {
        if (hash.StartsWith("$2y$", StringComparison.Ordinal))
        {
            return "$2a$" + hash[4..];
        }

        return hash;
    }

    private static string ResolveRoleName(UserEntity user)
    {
        return user.RoleId == 1 ? "admin" : "user";
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

    private static string? ResolveDeviceName(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return null;
        }

        var ua = userAgent.ToLowerInvariant();
        if (ua.Contains("android")) return "Android";
        if (ua.Contains("iphone") || ua.Contains("ipad") || ua.Contains("ios")) return "iOS";
        if (ua.Contains("windows")) return "Windows";
        if (ua.Contains("mac os") || ua.Contains("macintosh")) return "macOS";
        if (ua.Contains("linux")) return "Linux";
        return "Unknown";
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public string TokenType { get; set; } = string.Empty;

    public LoginUserResponse? User { get; set; }
}

public class RefreshRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class LogoutRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class LoginUserResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int? RoleId { get; set; }

    public string Role { get; set; } = string.Empty;
}

public class TokenPair
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }
}
