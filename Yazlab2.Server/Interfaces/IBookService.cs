using Yazlab2.DTOs;

namespace Yazlab2.Interfaces
{
    public interface IBookService
    {
        Task<List<BookDto>> SearchBooksAsync(string query);
        Task<BookDto> GetBookDetailAsync(string id);
    }
}