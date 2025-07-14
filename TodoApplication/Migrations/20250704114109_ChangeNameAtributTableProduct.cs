using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApplication.Migrations
{
    /// <inheritdoc />
    public partial class ChangeNameAtributTableProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Naziv",
                table: "Products",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "DostupanProizvod",
                table: "Products",
                newName: "AvailableProduct");

            migrationBuilder.RenameColumn(
                name: "Cena",
                table: "Products",
                newName: "Price");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Price",
                table: "Products",
                newName: "Cena");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Products",
                newName: "Naziv");

            migrationBuilder.RenameColumn(
                name: "AvailableProduct",
                table: "Products",
                newName: "DostupanProizvod");
        }
    }
}
