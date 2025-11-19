namespace Yazlab2.DTOs
{
    public class MovieDto
    {
        public int Id { get; set; } // TMDb ID'si
        public string Title { get; set; }
        public string Overview { get; set; }
        public string PosterPath { get; set; } // Resim linki
        public string ReleaseDate { get; set; }
        public double VoteAverage { get; set; }
    }

    // TMDb'den gelen ana cevabı karşılamak için yardımcı sınıf
    public class TmdbResponse
    {
        public List<TmdbResult> Results { get; set; }
    }

    public class TmdbResult
    {
        public int id { get; set; }
        public string title { get; set; }
        public string overview { get; set; }
        public string poster_path { get; set; }
        public string release_date { get; set; }
        public double vote_average { get; set; }
    }
}