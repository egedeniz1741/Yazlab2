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
    public class LibraryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITmdbService _tmdbService;
        private readonly IBookService _bookService;

        public LibraryController(AppDbContext context, ITmdbService tmdbService, IBookService bookService)
        {
            _context = context;
            _tmdbService = tmdbService;
            _bookService = bookService;
        }

        // --- FİLM EKLEME / GÜNCELLEME ---
        [HttpPost("add-movie")]
        public async Task<IActionResult> AddMovieToLibrary([FromBody] AddMovieDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            // 1. Film yerel veritabanımızda var mı?
            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == request.TmdbId.ToString());

            if (movie == null)
            {
                // Yoksa TMDb'den çekip kaydedelim
                var tmdbMovie = await _tmdbService.GetMovieDetailAsync(request.TmdbId);
                if (tmdbMovie == null) return BadRequest("Film TMDb'de bulunamadı.");

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

            // 2. Kullanıcı ilişkisi var mı?
            var existingRelation = await _context.UserMovies
                .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == movie.Id);

            if (existingRelation != null)
            {
                // Varsa güncelle
                existingRelation.Status = request.Status;

                // Eğer puan gönderildiyse puanı da güncelle
                if (request.Rating.HasValue && request.Rating > 0)
                {
                    existingRelation.Rating = request.Rating;
                }

                existingRelation.UpdatedAt = DateTime.Now;
            }
            else
            {
                // Yoksa yeni oluştur
                var userMovie = new UserMovie
                {
                    UserId = userId,
                    MovieId = movie.Id,
                    Status = request.Status,
                    Rating = request.Rating, // Puan varsa kaydet
                    UpdatedAt = DateTime.Now
                };
                _context.UserMovies.Add(userMovie);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Film kütüphaneye eklendi/güncellendi!" });
        }

        // --- KİTAP EKLEME / GÜNCELLEME ---
        [HttpPost("add-book")]
        public async Task<IActionResult> AddBookToLibrary([FromBody] AddBookDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            // 1. Kitap var mı?
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

            // 2. İlişkiyi kur/güncelle
            var existingRelation = await _context.UserBooks
                .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == book.Id);

            if (existingRelation != null)
            {
                existingRelation.Status = request.Status;

                if (request.Rating.HasValue && request.Rating > 0)
                {
                    existingRelation.Rating = request.Rating;
                }

                existingRelation.UpdatedAt = DateTime.Now;
            }
            else
            {
                var userBook = new UserBook
                {
                    UserId = userId,
                    BookId = book.Id,
                    Status = request.Status,
                    Rating = request.Rating,
                    UpdatedAt = DateTime.Now
                };
                _context.UserBooks.Add(userBook);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Kitap kütüphaneye eklendi/güncellendi!" });
        }

        // --- KÜTÜPHANEMİ GETİR (Filmler) ---
        [HttpGet("my-movies")]
        public async Task<IActionResult> GetMyMovies()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            var userMovies = await _context.UserMovies
                .Where(um => um.UserId == userId)
                .Include(um => um.Movie)
                .Select(um => new
                {
                    Id = um.Movie.Id,
                    TmdbId = um.Movie.TmdbId,
                    Title = um.Movie.Title,
                    PosterUrl = um.Movie.PosterUrl,
                    Status = um.Status,
                    Rating = um.Rating
                })
                .ToListAsync();

            return Ok(userMovies);
        }

        // --- KÜTÜPHANEMİ GETİR (Kitaplar) ---
        [HttpGet("my-books")]
        public async Task<IActionResult> GetMyBooks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            var userBooks = await _context.UserBooks
                .Where(ub => ub.UserId == userId)
                .Include(ub => ub.Book)
                .Select(ub => new
                {
                    Id = ub.Book.Id,
                    GoogleId = ub.Book.GoogleBookId,
                    Title = ub.Book.Title,
                    CoverUrl = ub.Book.CoverUrl,
                    Status = ub.Status,
                    Rating = ub.Rating
                })
                .ToListAsync();

            return Ok(userBooks);
        }
        [HttpGet("movie-status/{tmdbId}")]
        public async Task<IActionResult> GetMovieStatus(int tmdbId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Ok(new { rating = 0, status = "None" });
            int userId = int.Parse(userIdClaim.Value);

            // Önce filmi kendi DB'mizde bul (Yoksa zaten puan verilmemiştir)
            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbId.ToString());
            if (movie == null) return Ok(new { rating = 0, status = "None" });

            var relation = await _context.UserMovies.FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == movie.Id);

            if (relation == null) return Ok(new { rating = 0, status = "None" });

            return Ok(new { rating = relation.Rating ?? 0, status = relation.Status });
        }

       
        [HttpGet("book-status/{googleId}")]
        public async Task<IActionResult> GetBookStatus(string googleId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Ok(new { rating = 0, status = "None" });
            int userId = int.Parse(userIdClaim.Value);

            var book = await _context.Books.FirstOrDefaultAsync(b => b.GoogleBookId == googleId);
            if (book == null) return Ok(new { rating = 0, status = "None" });

            var relation = await _context.UserBooks.FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == book.Id);

            if (relation == null) return Ok(new { rating = 0, status = "None" });

            return Ok(new { rating = relation.Rating ?? 0, status = relation.Status });
        }
        [HttpGet("user-movies/{username}")]
        public async Task<IActionResult> GetUserMovies(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            var userMovies = await _context.UserMovies
                .Where(um => um.UserId == user.Id)
                .Include(um => um.Movie)
                .Select(um => new
                {
                    Id = um.Movie.Id,
                    TmdbId = um.Movie.TmdbId,
                    Title = um.Movie.Title,
                    PosterUrl = um.Movie.PosterUrl,
                    Status = um.Status,
                    Rating = um.Rating
                })
                .ToListAsync();

            return Ok(userMovies);
        }

       
        [HttpGet("user-books/{username}")]
        public async Task<IActionResult> GetUserBooks(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            var userBooks = await _context.UserBooks
                .Where(ub => ub.UserId == user.Id)
                .Include(ub => ub.Book)
                .Select(ub => new
                {
                    Id = ub.Book.Id,
                    GoogleId = ub.Book.GoogleBookId,
                    Title = ub.Book.Title,
                    CoverUrl = ub.Book.CoverUrl,
                    Status = ub.Status,
                    Rating = ub.Rating
                })
                .ToListAsync();

            return Ok(userBooks);
        }
    }
}