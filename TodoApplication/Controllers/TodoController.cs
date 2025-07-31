using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TodoApplication.Models;
using TodoApplication.Models.DTO;


namespace TodoApplication.Controllers
{
    [Authorize]
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
        public IActionResult GetTodos([FromQuery] int page = 1, [FromQuery] int pageSize = 5,
            [FromQuery] bool showArchived = false)
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);


            if (page <= 0 || pageSize <= 0)
                return BadRequest("Neispravni parametri.");
            
            var skip = (page - 1) * pageSize;

            //Filtriraj po arhiviranju
            var query = _context.Todos.Where(t => t.UserId == userId);
           // var query = _context.Todos.AsQueryable();

            //filtriraj po korisniku
            //Ako ne tražimo arhivirane, filtriraj samo aktivne
            if (!showArchived)
                query = query.Where(t => !t.IsArchived);

            var total = query.Count();

            var todos = query
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
        public IActionResult AddTodo([FromBody] TodoDTO todoDTO)
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null)
                return Unauthorized();

            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }

            int userId = int.Parse(userIdClaim.Value);

            var todo = new Todo
            {
                Title = todoDTO.Title,
                Date = todoDTO.Date,
                Priority = string.IsNullOrWhiteSpace(todoDTO.Priority) ? "low" : todoDTO.Priority,
                IsCompleted = todoDTO.IsCompleted,
                IsArchived = false,
                //UserId dodeljujem novom Todo objektu
                UserId = userId
            };

            _context.Todos.Add(todo);
            _context.SaveChanges();
            return Ok(todo);
            
        }

        [HttpPut("{id}/archive")]
        public IActionResult ArchiveTodo(int id)
        {
            var userIdClaim = User.FindFirst("UserId");
            if(userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);
            var todo = _context.Todos.FirstOrDefault(t=> t.Id == id && t.UserId == userId);
            if (todo == null)
                return NotFound();

            todo.IsArchived = true;
            _context.SaveChanges();

            return Ok(todo);
        }

        [HttpPut("{id}")] 
        public IActionResult UpdateTodo(int id, [FromBody] TodoDTO updatedTodoDTO)
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null)
                return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingTodo = _context.Todos.FirstOrDefault(t => t.Id == id && t.UserId == userId);
            if (existingTodo == null)
                return NotFound();

            existingTodo.Title = updatedTodoDTO.Title;
            existingTodo.IsCompleted = updatedTodoDTO.IsCompleted;
            existingTodo.Date = updatedTodoDTO.Date;
            existingTodo.Priority = string.IsNullOrWhiteSpace(updatedTodoDTO.Priority) ? "low" : updatedTodoDTO.Priority;

            _context.SaveChanges();

            return Ok(existingTodo);
        }

        [HttpDelete("{id}")]
        public IActionResult ArchivedTodo(int id) 
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null)
                return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);


            var todo = _context.Todos.FirstOrDefault(t => t.Id == id && t.UserId == userId);
            if(todo == null)
                return NotFound();

            // Ne brisem, samo arhiviram
            todo.IsArchived = true;
            //_context.Todos.Remove(todo);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
