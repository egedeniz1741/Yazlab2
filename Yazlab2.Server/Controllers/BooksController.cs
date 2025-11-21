using Microsoft.AspNetCore.Mvc;
using Yazlab2.Interfaces;

namespace Yazlab2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchBooks(
            [FromQuery] string? query,
            [FromQuery] string? genre, 
            [FromQuery] int? year,
            [FromQuery] int page = 1)
        {
           
            var finalQuery = string.IsNullOrWhiteSpace(query) ? "books" : query;

            // Filtreleri ekle
            if (!string.IsNullOrEmpty(genre)) finalQuery += $"+subject:{genre}";
            if (year.HasValue) finalQuery += $"+key_date:{year}"; 

            var books = await _bookService.SearchBooksAsync(finalQuery, page);
            return Ok(books);
        }

        [HttpGet("{id}")] 
        public async Task<IActionResult> GetBookDetail(string id)
        {
            var book = await _bookService.GetBookDetailAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
        }
    }
}