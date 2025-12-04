using Microsoft.AspNetCore.Mvc;
using Yazlab2.Server.Interfaces;

namespace Yazlab2.Controllers
{
    [Route("api/[controller]")] 
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

       
        public MoviesController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

      

        [HttpGet("{id}")]  
        public async Task<IActionResult> GetMovieDetail(int id)
        {
            var movie = await _tmdbService.GetMovieDetailAsync(id);

            if (movie == null) return NotFound("Film bulunamadı.");

            return Ok(movie);
        }
        [HttpGet("search")] 
        public async Task<IActionResult> SearchMovies([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Arama metni boş olamaz.");

            var movies = await _tmdbService.SearchMoviesAsync(query);
            return Ok(movies);
        }
        [HttpGet("genres")]
        public async Task<IActionResult> GetGenres()
        {
            var genres = await _tmdbService.GetGenresAsync();
            return Ok(genres);
        }
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularMovies([FromQuery] int page = 1)
        {
            var movies = await _tmdbService.GetPopularMoviesAsync(page);
            return Ok(movies);
        }

        [HttpGet("discover")]
        public async Task<IActionResult> Discover(
            [FromQuery] string? query, 
            [FromQuery] int? genreId,
            [FromQuery] int? year,
            [FromQuery] double? minRating,
            [FromQuery] int page = 1)
        {
            
            if (!string.IsNullOrWhiteSpace(query))
            {
                
                
                var searchResults = await _tmdbService.SearchMoviesAsync(query);
                return Ok(searchResults);
            }

            
            var movies = await _tmdbService.DiscoverMoviesAsync(genreId, year, minRating, page);
            return Ok(movies);
        }
    }
}