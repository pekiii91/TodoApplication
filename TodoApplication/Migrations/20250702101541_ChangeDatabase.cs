using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApplication.Migrations
{
    /// <inheritdoc />
    public partial class ChangeDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Zavrseno",
                table: "Todos",
                newName: "IsCompleted");

            migrationBuilder.RenameColumn(
                name: "Naziv",
                table: "Todos",
                newName: "Title");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Todos",
                newName: "Naziv");

            migrationBuilder.RenameColumn(
                name: "IsCompleted",
                table: "Todos",
                newName: "Zavrseno");
        }
    }
}
