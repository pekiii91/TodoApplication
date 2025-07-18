using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApplication.Migrations
{
    /// <inheritdoc />
    public partial class AddIsArchivedToTodo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Todos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Todos");
        }
    }
}
