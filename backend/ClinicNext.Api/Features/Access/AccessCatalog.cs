namespace ClinicNext.Api.Features.Access;

public static class AccessCatalog
{
    public static readonly string[] MenuPermissions =
    [
        "menu.dashboard",
        "menu.pendaftaran",
        "menu.pelayanan",
        "menu.kasir",
        "menu.laporan",
        "menu.master",
        "menu.rekam-medis",
        "menu.pengaturan"
    ];

    public static readonly Dictionary<string, int> DefaultRoleIds = new(StringComparer.OrdinalIgnoreCase)
    {
        ["admin"] = 1,
        ["user"] = 2,
        ["kasir"] = 3,
        ["dokter"] = 4,
        ["perawat"] = 5,
        ["frontoffice"] = 6,
        ["superadmin"] = 7
    };

    public static readonly Dictionary<string, string[]> DefaultRolePermissions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["admin"] = MenuPermissions,
        ["superadmin"] = MenuPermissions,
        ["user"] = ["menu.dashboard"],
        ["kasir"] = ["menu.dashboard", "menu.kasir"],
        ["dokter"] = ["menu.dashboard", "menu.pelayanan", "menu.rekam-medis"],
        ["perawat"] = ["menu.dashboard", "menu.pelayanan", "menu.rekam-medis"],
        ["frontoffice"] = ["menu.dashboard", "menu.pendaftaran"]
    };

    public static string NormalizeRoleCode(string value)
    {
        return value.Trim().ToLowerInvariant().Replace(' ', '-');
    }
}
