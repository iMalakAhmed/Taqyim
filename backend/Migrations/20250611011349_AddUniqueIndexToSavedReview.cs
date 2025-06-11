using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Taqyim.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexToSavedReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SavedReviews_UserId",
                table: "SavedReviews");

            migrationBuilder.CreateIndex(
                name: "IX_SavedReviews_UserId_ReviewId",
                table: "SavedReviews",
                columns: new[] { "UserId", "ReviewId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SavedReviews_UserId_ReviewId",
                table: "SavedReviews");

            migrationBuilder.CreateIndex(
                name: "IX_SavedReviews_UserId",
                table: "SavedReviews",
                column: "UserId");
        }
    }
}
