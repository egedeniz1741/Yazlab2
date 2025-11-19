using Microsoft.AspNetCore.Mvc;
using Yazlab2.Interfaces;

namespace Yazlab2.Controllers
{
    [Route("api/[controller]")] // Erişim adresi: api/movies
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        // Dependency Injection ile servisimizi çağırıyoruz
        public MoviesController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("popular")] // api/movies/popular
        public async Task<IActionResult> GetPopularMovies()
        {
            var movies = await _tmdbService.GetPopularMoviesAsync();
            return Ok(movies);
        }

        [HttpGet("search")] // api/movies/search?query=batman
        public async Task<IActionResult> SearchMovies([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Arama metni boş olamaz.");

            var movies = await _tmdbService.SearchMoviesAsync(query);
            return Ok(movies);
        }
    }
}