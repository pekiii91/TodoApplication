﻿using System.ComponentModel.DataAnnotations;

namespace TodoApplication.Models.DTO
{
    public class TodoDTO
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        public bool IsCompleted { get; set; } 
        public DateTime Date { get; set; } = DateTime.Today;
        public string Priority { get; set; } // Low, Medium, High
    }
}
