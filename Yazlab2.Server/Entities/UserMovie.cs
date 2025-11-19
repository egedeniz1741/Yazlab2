namespace Yazlab2.Entities
{
    public class UserMovie
    {
        public int UserId { get; set; }
        public User User { get; set; }

        public int MovieId { get; set; }
        public Movie Movie { get; set; }

        
        public int? Rating { get; set; }

        
        public string Status { get; set; } = "None";

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}