namespace ClinicNext.Api.Domain.Entities;

public class RolePermissionEntity
{
    public long Id { get; set; }

    public int RoleId { get; set; }

    public string PermissionKey { get; set; } = string.Empty;

    public bool Allowed { get; set; } = true;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
