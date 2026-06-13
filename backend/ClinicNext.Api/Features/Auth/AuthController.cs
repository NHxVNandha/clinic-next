using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using ClinicNext.Api.Data;
using ClinicNext.Api.Domain.Entities;
using ClinicNext.Api.Features.Access;
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

        if ((user.Status ?? 1) != 1)
        {
            return Unauthorized(ApiResponse<object>.Fail("Akun nonaktif. Hubungi administrator.", HttpContext.TraceIdentifier));
        }

        var tokenPair = await IssueTokenPairAsync(user);
        var loginUser = await BuildLoginUserResponseAsync(user);

        return Ok(ApiResponse<LoginResponse>.Ok(new LoginResponse
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshToken,
            ExpiresAtUtc = tokenPair.ExpiresAtUtc,
            TokenType = "Bearer",
            User = loginUser
        }, "Login berhasil.", HttpContext.TraceIdentifier));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var name = request.Name.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var password = request.Password;

        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return BadRequest(ApiResponse<object>.Fail("Nama, email, dan password wajib diisi.", HttpContext.TraceIdentifier));
        }

        if (!email.Contains('@') || !email.Contains('.'))
        {
            return BadRequest(ApiResponse<object>.Fail("Format email tidak valid.", HttpContext.TraceIdentifier));
        }

        if (password.Length < 8)
        {
            return BadRequest(ApiResponse<object>.Fail("Password minimal 8 karakter.", HttpContext.TraceIdentifier));
        }

        if (password != request.ConfirmPassword)
        {
            return BadRequest(ApiResponse<object>.Fail("Konfirmasi password tidak sama.", HttpContext.TraceIdentifier));
        }

        var exists = await _dbContext.Users.AnyAsync(x => x.Email.ToLower() == email);
        if (exists)
        {
            return Conflict(ApiResponse<object>.Fail("Email sudah terdaftar.", HttpContext.TraceIdentifier));
        }

        var now = DateTime.UtcNow;
        var user = new UserEntity
        {
            Name = name,
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(password),
            RoleId = 2,
            Status = 1,
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.RoleId,
            Role = await ResolveRoleNameAsync(user),
            Permissions = await ResolvePermissionsAsync(user.RoleId)
        }, "Akun berhasil dibuat. Silakan login.", HttpContext.TraceIdentifier));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(sub, out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Token tidak valid.", HttpContext.TraceIdentifier));
        }

        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("User tidak ditemukan.", HttpContext.TraceIdentifier));
        }

        if ((user.Status ?? 1) != 1)
        {
            return Unauthorized(ApiResponse<object>.Fail("Akun nonaktif. Hubungi administrator.", HttpContext.TraceIdentifier));
        }

        return Ok(ApiResponse<LoginUserResponse>.Ok(await BuildLoginUserResponseAsync(user), "Profil user berhasil diambil.", HttpContext.TraceIdentifier));
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

        if ((user.Status ?? 1) != 1)
        {
            return Unauthorized(ApiResponse<object>.Fail("Akun nonaktif. Hubungi administrator.", HttpContext.TraceIdentifier));
        }

        tokenEntity.RevokedAt = now;
        tokenEntity.UpdatedAt = now;

        var tokenPair = await IssueTokenPairAsync(user);
        var loginUser = await BuildLoginUserResponseAsync(user);

        return Ok(ApiResponse<LoginResponse>.Ok(new LoginResponse
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshToken,
            ExpiresAtUtc = tokenPair.ExpiresAtUtc,
            TokenType = "Bearer",
            User = loginUser
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
        var roleName = await ResolveRoleNameAsync(user);
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

    private async Task<LoginUserResponse> BuildLoginUserResponseAsync(UserEntity user)
    {
        return new LoginUserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            RoleId = user.RoleId,
            Role = await ResolveRoleNameAsync(user),
            Permissions = await ResolvePermissionsAsync(user.RoleId),
            Status = user.Status ?? 1
        };
    }

    private async Task<string> ResolveRoleNameAsync(UserEntity user)
    {
        if (user.RoleId.HasValue)
        {
            var role = await _dbContext.Roles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == user.RoleId.Value);
            if (!string.IsNullOrWhiteSpace(role?.Code))
            {
                return role.Code;
            }
        }

        return user.RoleId == 1 ? "admin" : "user";
    }

    private async Task<string[]> ResolvePermissionsAsync(int? roleId)
    {
        if (!roleId.HasValue)
        {
            return [];
        }

        var permissions = await _dbContext.RolePermissions.AsNoTracking()
            .Where(x => x.RoleId == roleId.Value && x.Allowed)
            .Select(x => x.PermissionKey)
            .ToArrayAsync();

        if (permissions.Length > 0)
        {
            return permissions;
        }

        var role = AccessCatalog.DefaultRoleIds.FirstOrDefault(x => x.Value == roleId.Value).Key;
        return string.IsNullOrWhiteSpace(role)
            ? []
            : AccessCatalog.DefaultRolePermissions.GetValueOrDefault(role) ?? [];
    }

    private int? GetCurrentUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
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

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;
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

    public int Status { get; set; } = 1;

    public string[] Permissions { get; set; } = [];
}

public class TokenPair
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }
}
