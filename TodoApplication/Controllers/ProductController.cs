using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApplication.Models;

namespace TodoApplication.Controllers
{
    [ApiController]   //omogućava validaciju modela i integraciju sa Swagger-om
    [Route("api/[controller]")] //određuje putanju api/product
    public class ProductController : Controller
    {
        private readonly TodoDbContext _context;

        public ProductController(TodoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetProducts()
        {
            return Ok(_context.Products.ToList());

        }

        //POST: api/products
        [HttpPost]
        public  IActionResult AddProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Products.Add(product);
            _context.SaveChanges(); //sacuvas u bazi

            return Ok();
        }

        [HttpPut("{id}")]
        public IActionResult UpdateProduct(int id, [FromBody] Todo updatedProduct)
        {
            if (id != updatedProduct.Id)
                return BadRequest("ID se ne poklapa.");

            var existingProduct = _context.Todos.Find(id);
            if (existingProduct == null)
                return NotFound();

            existingProduct.Id = updatedProduct.Id;
            existingProduct.Title = updatedProduct.Title;
            existingProduct.IsCompleted = updatedProduct.IsCompleted;
            existingProduct.Date = updatedProduct.Date;

            _context.SaveChanges();

            return Ok(existingProduct);
        }

        //DELETE: api/products
        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
