using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TodoApplication.Models
{
    public class Todo
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime Date { get; set; } = DateTime.Today;
        public string Priority { get; set; } // Low, Medium, High
        public bool IsArchived { get; set; } = false;


        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
