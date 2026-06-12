using ClinicNext.Api.Domain.Entities;
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
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Seeded initial admin user {Email}.", normalizedEmail);
    }
}
