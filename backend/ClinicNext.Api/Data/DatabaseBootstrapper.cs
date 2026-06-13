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
    }
}
