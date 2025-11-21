using Yazlab2.DTOs;

namespace Yazlab2.Server.Interfaces
{
    public interface ITmdbService
    {
        // Popüler filmleri getir
    

        // İsimle film ara
        Task<List<MovieDto>> SearchMoviesAsync(string query);
        Task<MovieDto> GetMovieDetailAsync(int id);

        Task<List<GenreDto>> GetGenresAsync();
       
        Task<List<MovieDto>> GetPopularMoviesAsync(int page);
        Task<List<MovieDto>> DiscoverMoviesAsync(int? genreId, int? year, double? minRating, int page);
    }
}