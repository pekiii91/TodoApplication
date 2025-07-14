using System.ComponentModel.DataAnnotations;

namespace TodoApplication.Models
{
    public class Todo
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        public bool IsCompleted { get; set; }

        public DateTime Date { get; set; } = DateTime.Today;
    }
}
