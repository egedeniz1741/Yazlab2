using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Yazlab2.Data;
using Yazlab2.DTOs;
using Yazlab2.Entities;
using Yazlab2.Interfaces;
using Yazlab2.Server.Interfaces;

namespace Yazlab2.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CustomListController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITmdbService _tmdbService;
        private readonly IBookService _bookService;

        public CustomListController(AppDbContext context, ITmdbService tmdbService, IBookService bookService)
        {
            _context = context;
            _tmdbService = tmdbService;
            _bookService = bookService;
        }

        
        [HttpPost("create")]
        public async Task<IActionResult> CreateList([FromBody] CreateListDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var list = new CustomList
            {
                UserId = userId,
                Name = request.Name
            };

            _context.CustomLists.Add(list);
            await _context.SaveChangesAsync();
            return Ok("Liste oluşturuldu.");
        }

        
        [HttpGet("my-lists")]
        public async Task<IActionResult> GetMyLists()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var lists = await _context.CustomLists
                .Where(l => l.UserId == userId)
                .Include(l => l.Items).ThenInclude(i => i.Movie)
                .Include(l => l.Items).ThenInclude(i => i.Book)
                .Select(l => new CustomListDisplayDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    ItemCount = l.Items.Count,
                   
                    Thumbnails = l.Items.Select(i => i.Movie != null ? i.Movie.PosterUrl : i.Book.CoverUrl)
                                        .Take(3).ToList()
                })
                .ToListAsync();

            return Ok(lists);
        }

        
        [HttpPost("add-item")]
        public async Task<IActionResult> AddItem([FromBody] AddItemDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var list = await _context.CustomLists.FirstOrDefaultAsync(l => l.Id == request.ListId && l.UserId == userId);

            if (list == null) return NotFound("Liste bulunamadı.");

            int? movieId = null;
            int? bookId = null;

            
            if (request.TmdbId.HasValue)
            {
                var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == request.TmdbId.ToString());
                if (movie == null)
                {
                    var tmdbMovie = await _tmdbService.GetMovieDetailAsync(request.TmdbId.Value);
                    if (tmdbMovie == null) return BadRequest("Film bulunamadı.");

                    movie = new Movie
                    {
                        TmdbId = tmdbMovie.Id.ToString(),
                        Title = tmdbMovie.Title,
                        Overview = tmdbMovie.Overview,
                        PosterUrl = tmdbMovie.PosterPath,
                        ReleaseDate = tmdbMovie.ReleaseDate,
                        AverageRating = tmdbMovie.VoteAverage
                    };
                    _context.Movies.Add(movie);
                    await _context.SaveChangesAsync();
                }
                movieId = movie.Id;
            }
            
            else if (!string.IsNullOrEmpty(request.GoogleId))
            {
                var book = await _context.Books.FirstOrDefaultAsync(b => b.GoogleBookId == request.GoogleId);
                if (book == null)
                {
                    var apiBook = await _bookService.GetBookDetailAsync(request.GoogleId);
                    if (apiBook == null) return BadRequest("Kitap bulunamadı.");

                    book = new Book
                    {
                        GoogleBookId = apiBook.Id,
                        Title = apiBook.Title,
                        Authors = string.Join(", ", apiBook.Authors),
                        Description = apiBook.Description,
                        CoverUrl = apiBook.CoverUrl,
                        PageCount = apiBook.PageCount
                    };
                    _context.Books.Add(book);
                    await _context.SaveChangesAsync();
                }
                bookId = book.Id;
            }

           
            bool exists = await _context.CustomListItems.AnyAsync(i =>
                i.CustomListId == list.Id &&
                ((movieId != null && i.MovieId == movieId) || (bookId != null && i.BookId == bookId)));

            if (exists) return BadRequest("Bu içerik zaten listede var.");

            var item = new CustomListItem
            {
                CustomListId = list.Id,
                MovieId = movieId,
                BookId = bookId
            };

            _context.CustomListItems.Add(item);
            await _context.SaveChangesAsync();
            return Ok("Listeye eklendi.");
        }

        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteList(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var list = await _context.CustomLists.FindAsync(id);

            if (list == null || list.UserId != userId) return NotFound();

            _context.CustomLists.Remove(list); 
            await _context.SaveChangesAsync();
            return Ok("Liste silindi.");
        }
        [HttpGet("user-lists/{userId}")]
        public async Task<IActionResult> GetUserLists(int userId)
        {
            var lists = await _context.CustomLists
                .Where(l => l.UserId == userId)
                .Include(l => l.Items).ThenInclude(i => i.Movie)
                .Include(l => l.Items).ThenInclude(i => i.Book)
                .Select(l => new CustomListDisplayDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    ItemCount = l.Items.Count,
                    Thumbnails = l.Items.Select(i => i.Movie != null ? i.Movie.PosterUrl : i.Book.CoverUrl)
                                        .Take(3).ToList()
                })
                .ToListAsync();

            return Ok(lists);
        }

       
        [HttpGet("{id}")]
        public async Task<IActionResult> GetListDetail(int id)
        {
            var list = await _context.CustomLists
                .Include(l => l.User) 
                .Include(l => l.Items).ThenInclude(i => i.Movie)
                .Include(l => l.Items).ThenInclude(i => i.Book)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (list == null) return NotFound("Liste bulunamadı.");

           
            var result = new
            {
                list.Id,
                list.Name,
                OwnerId = list.UserId,
                OwnerName = list.User.Username,
                Items = list.Items.Select(i => new
                {
                    Id = i.Id, 
                    Type = i.Movie != null ? "Movie" : "Book",
                    ContentId = i.Movie != null ? i.Movie.TmdbId : i.Book.GoogleBookId, 
                    Title = i.Movie != null ? i.Movie.Title : i.Book.Title,
                    Image = i.Movie != null ? i.Movie.PosterUrl : i.Book.CoverUrl,
                    Date = i.AddedAt
                }).OrderByDescending(x => x.Date).ToList()
            };

            return Ok(result);
        }
    }
}