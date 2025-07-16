using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApplication.Models;


namespace TodoApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")] ///određuje putanju api/todo
    public class TodoController : Controller
    {
        private readonly TodoDbContext _context;

        public TodoController(TodoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetTodos([FromQuery] int page = 1, [FromQuery] int pageSize = 5)
        {
            if (page <= 0 || pageSize <= 0)
                return BadRequest("Neispravni parametri.");

            var skip = (page - 1) * pageSize;
            var total = _context.Todos.Count();

            var todos = _context.Todos
                .OrderBy(x => x.Id)
                .Skip(skip)
                .Take(pageSize)
                .ToList();

            var response = new
            {
                data = todos,
                currentPage = page,
                totalItems = total,
                totalPages = (int)Math.Ceiling((double)total / pageSize)
            };


            return Ok(response);

        }

        [HttpPost]
        public IActionResult AddTodo([FromBody] Todo todo)
        {
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(todo.Priority))
                todo.Priority = "low";

            _context.Todos.Add(todo);
            _context.SaveChanges();

            return Ok(todo); // Vraćam kreirani todo kao JSON response
        }

        [HttpPut("{id}")] 
        public IActionResult UpdateTodo(int id, [FromBody] Todo updatedTodo)
        {
            if (id != updatedTodo.Id)
                return BadRequest("ID se ne poklapa.");

            var existingTodo = _context.Todos.Find(id);
            if (existingTodo == null)
                return NotFound();

            existingTodo.Id = updatedTodo.Id;
            existingTodo.Title = updatedTodo.Title;
            existingTodo.IsCompleted = updatedTodo.IsCompleted;
            existingTodo.Date = updatedTodo.Date;
            existingTodo.Priority = string.IsNullOrWhiteSpace(updatedTodo.Priority) ? "low" : updatedTodo.Priority;

            _context.SaveChanges();

            return Ok(existingTodo);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteTodo(int id) 
        {
            var todo = _context.Todos.Find(id);
            if(todo == null)
                return NotFound();

            _context.Todos.Remove(todo);
            _context.SaveChanges();
            return NoContent();
        }


    }
}
