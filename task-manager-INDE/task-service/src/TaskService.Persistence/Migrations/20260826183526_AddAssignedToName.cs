using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskService.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedToName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "assigned_to_name",
                table: "tasks",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "assigned_to_name",
                table: "tasks");
        }
    }
}
