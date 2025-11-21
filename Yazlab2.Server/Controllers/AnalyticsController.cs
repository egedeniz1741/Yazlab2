using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Yazlab2.Data;

namespace Yazlab2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Platformun En Popüler Filmleri (En çok listeye eklenenler)
        [HttpGet("popular-movies")]
        public async Task<IActionResult> GetPopularMovies()
        {
            // DÜZELTME: Önce istatistiği çekiyoruz, sonra Join ile film detayını alıyoruz.
            var movies = await _context.UserMovies
                .GroupBy(um => um.MovieId)
                .Select(g => new
                {
                    MovieId = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(10)
                .Join(_context.Movies,
                    stat => stat.MovieId,
                    movie => movie.Id,
                    (stat, movie) => new
                    {
                        movie.Id,
                        movie.TmdbId,
                        movie.Title,
                        movie.PosterUrl,
                        movie.ReleaseDate,
                        movie.AverageRating,
                        PlatformCount = stat.Count
                    })
                .ToListAsync();

            return Ok(movies);
        }

        // 2. Platformun En Yüksek Puanlı Filmleri (Kullanıcı puanlarına göre)
        [HttpGet("top-rated-movies")]
        public async Task<IActionResult> GetTopRatedMovies()
        {
            // DÜZELTME: Hata veren kısım burasıydı. Join yapısı ile çözüldü.
            var movies = await _context.UserMovies
                .Where(um => um.Rating.HasValue && um.Rating > 0)
                .GroupBy(um => um.MovieId)
                .Select(g => new
                {
                    MovieId = g.Key,
                    Average = g.Average(um => (double)um.Rating) // Double cast önemli
                })
                .OrderByDescending(x => x.Average)
                .Take(10)
                .Join(_context.Movies,
                    stat => stat.MovieId,
                    movie => movie.Id,
                    (stat, movie) => new
                    {
                        movie.Id,
                        movie.TmdbId,
                        movie.Title,
                        movie.PosterUrl,
                        movie.ReleaseDate,
                        PlatformRating = stat.Average
                    })
                .ToListAsync();

            return Ok(movies);
        }

        // 3. Platformun En Popüler Kitapları
        [HttpGet("popular-books")]
        public async Task<IActionResult> GetPopularBooks()
        {
            var books = await _context.UserBooks
                .GroupBy(ub => ub.BookId)
                .Select(g => new
                {
                    BookId = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(10)
                .Join(_context.Books,
                    stat => stat.BookId,
                    book => book.Id,
                    (stat, book) => new
                    {
                        book.Id,
                        book.GoogleBookId,
                        book.Title,
                        book.CoverUrl,
                        book.Authors,
                        PlatformCount = stat.Count
                    })
                .ToListAsync();

            return Ok(books);
        }
    }
}