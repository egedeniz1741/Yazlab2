using Yazlab2.DTOs; // Birazdan oluşturacağız

namespace Yazlab2.Interfaces
{
    public interface ITmdbService
    {
        // Popüler filmleri getir
        Task<List<MovieDto>> GetPopularMoviesAsync();

        // İsimle film ara
        Task<List<MovieDto>> SearchMoviesAsync(string query);
    }
}