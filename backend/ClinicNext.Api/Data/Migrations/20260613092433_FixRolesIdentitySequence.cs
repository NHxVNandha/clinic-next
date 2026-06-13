using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicNext.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixRolesIdentitySequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1), true)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
