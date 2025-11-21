public class AddMovieDto
{
    public int TmdbId { get; set; }
    public string Status { get; set; }
    public int? Rating { get; set; } // YENİ: 1-10 arası puan
}