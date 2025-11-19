namespace Yazlab2.Entities
{
    public class UserBook
    {
        public int UserId { get; set; }
        public User User { get; set; }

        public int BookId { get; set; }
        public Book Book { get; set; }

        public int? Rating { get; set; }
        public string Status { get; set; } = "None"; 

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}