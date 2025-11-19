using System.ComponentModel.DataAnnotations;

namespace Yazlab2.Entities
{
    public class Movie
    {
        [Key]
        public int Id { get; set; } 

        public string? TmdbId { get; set; } 

        public string Title { get; set; }
        public string? Overview { get; set; }
        public string? PosterUrl { get; set; }
        public string? ReleaseDate { get; set; }

        
        public double AverageRating { get; set; }

        public ICollection<UserMovie> UserMovies { get; set; }
        public ICollection<Review> Reviews { get; set; }
    }
}