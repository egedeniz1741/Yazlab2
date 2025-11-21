namespace Yazlab2.DTOs
{
    public class GenreDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class GenreResponse
    {
        public List<GenreDto> Genres { get; set; }
    }
}