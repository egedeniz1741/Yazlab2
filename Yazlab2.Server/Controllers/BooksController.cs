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

        [HttpGet("search")] // api/books/search?query=harry potter
        public async Task<IActionResult> SearchBooks([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return BadRequest("Arama boş olamaz.");
            var books = await _bookService.SearchBooksAsync(query);
            return Ok(books);
        }

        [HttpGet("{id}")] // api/books/zyTCAlFPjgYC
        public async Task<IActionResult> GetBookDetail(string id)
        {
            var book = await _bookService.GetBookDetailAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
        }
    }
}