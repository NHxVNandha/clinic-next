using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicNext.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSettingTaxId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "tax_id",
                table: "tm_setting",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "tax_id",
                table: "tm_setting");
        }
    }
}
