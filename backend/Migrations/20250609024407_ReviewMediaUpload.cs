using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Taqyim.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReviewMediaUpload : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReviewId",
                table: "Media",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReviewId",
                table: "Media");
        }
    }
}
