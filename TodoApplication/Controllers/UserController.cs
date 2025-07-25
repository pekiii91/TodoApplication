using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TodoApplication.Models;
using TodoApplication.Models.DTO;

namespace TodoApplication.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly IConfiguration _config;
        private readonly TodoDbContext _context;

        public UserController(IConfiguration config, TodoDbContext context)
        {
            _context = context;
            _config = config;
        }


        [HttpPost("register")]
        public IActionResult Register([FromBody] Register model)
        {
            if (_context.Users.Any(u => u.Username == model.Username))
                return BadRequest("Korisnicko ime vec postoji");

            var passHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var user = new User
            {
                Username = model.Username,
                PasswordHash = passHash,
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("Registracija uspesna");
        }



        [HttpPost("login")]
        public IActionResult Login([FromBody] Login model)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == model.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return Unauthorized("Pogresni podaci");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken
            (
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { token = tokenString });
        }
    }
}
