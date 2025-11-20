using Newtonsoft.Json;
using Yazlab2.DTOs;
using Yazlab2.Server.Interfaces;

namespace Yazlab2.Services
{
    public class TmdbService : ITmdbService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration; 
        private readonly string _baseUrl = "https://api.themoviedb.org/3";

        public TmdbService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<List<MovieDto>> GetPopularMoviesAsync()
        {
           
            var apiKey = _configuration["TMDb:ApiKey"];

            var response = await _httpClient.GetAsync($"{_baseUrl}/movie/popular?api_key={apiKey}&language=tr-TR");

            if (!response.IsSuccessStatusCode) return new List<MovieDto>();

            var jsonString = await response.Content.ReadAsStringAsync();
            var data = JsonConvert.DeserializeObject<TmdbResponse>(jsonString);

            if (data?.Results == null) return new List<MovieDto>();

            return data.Results.Select(m => new MovieDto
            {
                Id = m.id,
                Title = m.title,
                Overview = m.overview,
                
                PosterPath = !string.IsNullOrEmpty(m.poster_path)
                    ? "https://image.tmdb.org/t/p/w500" + m.poster_path
                    : "https://via.placeholder.com/500x750?text=No+Image",
                ReleaseDate = m.release_date,
                VoteAverage = m.vote_average
            }).ToList();
        }
        public async Task<MovieDto> GetMovieDetailAsync(int id)
        {
            var apiKey = _configuration["TMDb:ApiKey"];
            var response = await _httpClient.GetAsync($"{_baseUrl}/movie/{id}?api_key={apiKey}&language=tr-TR");

            if (!response.IsSuccessStatusCode) return null;

            var jsonString = await response.Content.ReadAsStringAsync();
           
            dynamic m = JsonConvert.DeserializeObject(jsonString);

            return new MovieDto
            {
                Id = m.id,
                Title = m.title,
                Overview = m.overview,
                PosterPath = m.poster_path != null
                    ? "https://image.tmdb.org/t/p/w500" + m.poster_path
                    : "https://via.placeholder.com/500x750?text=No+Image",
                ReleaseDate = m.release_date,
                VoteAverage = m.vote_average
            };
        }
        public async Task<List<MovieDto>> SearchMoviesAsync(string query)
        {
            var apiKey = _configuration["TMDb:ApiKey"];

            var response = await _httpClient.GetAsync($"{_baseUrl}/search/movie?api_key={apiKey}&query={query}&language=tr-TR");

            if (!response.IsSuccessStatusCode) return new List<MovieDto>();

            var jsonString = await response.Content.ReadAsStringAsync();
            var data = JsonConvert.DeserializeObject<TmdbResponse>(jsonString);

            if (data?.Results == null) return new List<MovieDto>();

            return data.Results.Select(m => new MovieDto
            {
                Id = m.id,
                Title = m.title,
                Overview = m.overview,
                PosterPath = !string.IsNullOrEmpty(m.poster_path)
                    ? "https://image.tmdb.org/t/p/w500" + m.poster_path
                    : "https://via.placeholder.com/500x750?text=No+Image",
                ReleaseDate = m.release_date,
                VoteAverage = m.vote_average
            }).ToList();
        }
    }
}