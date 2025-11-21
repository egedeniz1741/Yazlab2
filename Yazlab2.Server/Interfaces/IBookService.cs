using Yazlab2.DTOs;

namespace Yazlab2.Interfaces
{
    public interface IBookService
    {
        Task<List<BookDto>> SearchBooksAsync(string query, int page);
        Task<BookDto> GetBookDetailAsync(string id);
    }
}