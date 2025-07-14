using Microsoft.EntityFrameworkCore;
using System.Data.SqlTypes;
using TodoApplication.Models;
{ }


var builder = WebApplication.CreateBuilder(args);


//Dodavanje DbContexta, Registracija DbContexta
builder.Services.AddDbContext<TodoDbContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseHttpsRedirection();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}



app.UseCors("AllowFrontend");


app.UseAuthorization();

app.MapControllers();

app.Run();
