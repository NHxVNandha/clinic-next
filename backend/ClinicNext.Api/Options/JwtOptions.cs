namespace ClinicNext.Api.Options;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "ClinicNext";

    public string Audience { get; set; } = "ClinicNext.Client";

    public string Key { get; set; } = "ReplaceThisWithASecretKeyAtLeast32Chars";

    public int AccessTokenMinutes { get; set; } = 60;

    public int RefreshTokenDays { get; set; } = 30;
}
