using System.ComponentModel.DataAnnotations;

namespace TodoApplication.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; } 

        // Navigacija ka Todo zadacima
        public ICollection<Todo> Todos { get; set; }
    }
}
