using Microsoft.EntityFrameworkCore;

namespace TodoApplication.Models
{
    public class TodoDbContext : DbContext
    {
        public TodoDbContext(DbContextOptions<TodoDbContext> options) : base(options) { }

        public DbSet<Todo> Todos { get; set; }
        public DbSet<Product> Products { get; set; }
    }
}
