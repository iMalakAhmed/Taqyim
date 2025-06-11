using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Taqyim.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCascadeDeleteForReviewMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Media_Reviews_ReviewId",
                table: "Media");

            migrationBuilder.AddForeignKey(
                name: "FK_Media_Reviews_ReviewId",
                table: "Media",
                column: "ReviewId",
                principalTable: "Reviews",
                principalColumn: "ReviewId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Media_Reviews_ReviewId",
                table: "Media");

            migrationBuilder.AddForeignKey(
                name: "FK_Media_Reviews_ReviewId",
                table: "Media",
                column: "ReviewId",
                principalTable: "Reviews",
                principalColumn: "ReviewId");
        }
    }
}
