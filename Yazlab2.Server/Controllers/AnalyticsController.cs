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

        
        [HttpGet("popular-movies")]
        public async Task<IActionResult> GetPopularMovies()
        {
            
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

        
        [HttpGet("top-rated-movies")]
        public async Task<IActionResult> GetTopRatedMovies()
        {
            
            var movies = await _context.UserMovies
                .Where(um => um.Rating.HasValue && um.Rating > 0)
                .GroupBy(um => um.MovieId)
                .Select(g => new
                {
                    MovieId = g.Key,
                    Average = g.Average(um => (double)um.Rating) 
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