using Newtonsoft.Json;
using Yazlab2.DTOs;
using Yazlab2.Interfaces;

namespace Yazlab2.Services
{
    public class GoogleBookService : IBookService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "https://www.googleapis.com/books/v1/volumes";

        public GoogleBookService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<BookDto>> SearchBooksAsync(string query)
        {
            // Google Books API'de 'q' parametresi ile arama yapılır
            var response = await _httpClient.GetAsync($"{_baseUrl}?q={query}&maxResults=20");

            if (!response.IsSuccessStatusCode) return new List<BookDto>();

            var jsonString = await response.Content.ReadAsStringAsync();
            var data = JsonConvert.DeserializeObject<GoogleBooksResponse>(jsonString);

            if (data?.Items == null) return new List<BookDto>();

            return data.Items.Select(b => new BookDto
            {
                Id = b.Id,
                Title = b.VolumeInfo.Title,
                Authors = b.VolumeInfo.Authors ?? new List<string> { "Bilinmeyen Yazar" },
                Description = b.VolumeInfo.Description,
                PageCount = b.VolumeInfo.PageCount,
                PublishedDate = b.VolumeInfo.PublishedDate,
                // Kapak resmi yoksa placeholder koyuyoruz
                CoverUrl = b.VolumeInfo.ImageLinks?.Thumbnail
                           ?? "https://via.placeholder.com/128x196?text=No+Cover"
            }).ToList();
        }

        public async Task<BookDto> GetBookDetailAsync(string id)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/{id}");

            if (!response.IsSuccessStatusCode) return null;

            var jsonString = await response.Content.ReadAsStringAsync();
            var b = JsonConvert.DeserializeObject<GoogleBookItem>(jsonString);

            if (b == null) return null;

            return new BookDto
            {
                Id = b.Id,
                Title = b.VolumeInfo.Title,
                Authors = b.VolumeInfo.Authors ?? new List<string> { "Bilinmeyen Yazar" },
                Description = b.VolumeInfo.Description,
                PageCount = b.VolumeInfo.PageCount,
                PublishedDate = b.VolumeInfo.PublishedDate,
                CoverUrl = b.VolumeInfo.ImageLinks?.Thumbnail
                           ?? "https://via.placeholder.com/128x196?text=No+Cover"
            };
        }
    }
}