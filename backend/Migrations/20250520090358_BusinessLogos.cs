using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Taqyim.Api.Migrations
{
    /// <inheritdoc />
    public partial class BusinessLogos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Logo",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Logo",
                table: "Businesses");
        }
    }
}
