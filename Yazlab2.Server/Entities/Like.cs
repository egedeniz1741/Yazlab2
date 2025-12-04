namespace Yazlab2.Entities
{
    public class Like
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

       
        public int? MovieId { get; set; }
        public Movie? Movie { get; set; }

        public int? BookId { get; set; }
        public Book? Book { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}