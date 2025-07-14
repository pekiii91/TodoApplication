using System.ComponentModel.DataAnnotations;

namespace TodoApplication.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Naziv proizvod je obavezan")]
        [StringLength(100)]
        public string Name { get; set; }

        [Range(0.01, 9999.99, ErrorMessage ="Cena mora biti veca od 0.")]
        public decimal Price { get; set; }

        public bool AvailableProduct { get; set; }
    }
}
