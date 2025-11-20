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

        public LibraryController(AppDbContext context, ITmdbService tmdbService ,IBookService bookService)
        {
            _context = context;
            _tmdbService = tmdbService;
            _bookService = bookService;
        }
        [HttpPost("add-book")]
        public async Task<IActionResult> AddBookToLibrary([FromBody] AddBookDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            // 1. Kitap yerel DB'de var mı?
            var book = await _context.Books.FirstOrDefaultAsync(b => b.GoogleBookId == request.GoogleId);

            if (book == null)
            {
                // 2. Yoksa Google API'den çekip kaydet
                var apiBook = await _bookService.GetBookDetailAsync(request.GoogleId);
                if (apiBook == null) return BadRequest("Kitap bulunamadı.");

                book = new Book
                {
                    GoogleBookId = apiBook.Id,
                    Title = apiBook.Title,
                    Authors = string.Join(", ", apiBook.Authors), // Listeyi string'e çevir
                    Description = apiBook.Description,
                    CoverUrl = apiBook.CoverUrl,
                    PageCount = apiBook.PageCount
                };

                _context.Books.Add(book);
                await _context.SaveChangesAsync();
            }

            // 3. İlişkiyi Kur
            var existingRelation = await _context.UserBooks
                .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == book.Id);

            if (existingRelation != null)
            {
                existingRelation.Status = request.Status;
                existingRelation.UpdatedAt = DateTime.Now;
            }
            else
            {
                var userBook = new UserBook
                {
                    UserId = userId,
                    BookId = book.Id,
                    Status = request.Status,
                    UpdatedAt = DateTime.Now
                };
                _context.UserBooks.Add(userBook);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Kitap kütüphaneye eklendi!" });
        }
    
        [HttpPost("add-movie")]
        public async Task<IActionResult> AddMovieToLibrary([FromBody] AddMovieDto request)
        {
            // 1. Token'dan Kullanıcı ID'sini bul
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            // 2. Film yerel veritabanımızda var mı?
            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == request.TmdbId.ToString());

            if (movie == null)
            {
                // 3. Yoksa TMDb Servisinden detaylarını çekip kaydedelim
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
                await _context.SaveChangesAsync(); // ID oluşması için kaydet
            }

            // 4. Kullanıcı bu filmi daha önce eklemiş mi?
            var existingRelation = await _context.UserMovies
                .FirstOrDefaultAsync(um => um.UserId == userId && um.MovieId == movie.Id);

            if (existingRelation != null)
            {
                // Varsa durumunu güncelle (Örn: Listemden -> İzledim'e çek)
                existingRelation.Status = request.Status;
                existingRelation.UpdatedAt = DateTime.Now;
            }
            else
            {
                // Yoksa yeni ilişki kur
                var userMovie = new UserMovie
                {
                    UserId = userId,
                    MovieId = movie.Id,
                    Status = request.Status,                   
                    UpdatedAt = DateTime.Now
                };
                _context.UserMovies.Add(userMovie);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Film kütüphaneye eklendi!" });
        }
    }
}