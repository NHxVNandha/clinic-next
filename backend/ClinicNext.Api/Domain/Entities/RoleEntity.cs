namespace ClinicNext.Api.Domain.Entities;

public class RoleEntity
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public bool IsSystem { get; set; }

    public int Status { get; set; } = 1;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
