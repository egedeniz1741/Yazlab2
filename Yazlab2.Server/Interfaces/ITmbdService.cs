using Yazlab2.DTOs;

namespace Yazlab2.Server.Interfaces
{
    public interface ITmdbService
    {
        // Popüler filmleri getir
        Task<List<MovieDto>> GetPopularMoviesAsync();

        // İsimle film ara
        Task<List<MovieDto>> SearchMoviesAsync(string query);
        Task<MovieDto> GetMovieDetailAsync(int id);
    }
}