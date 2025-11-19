using System.ComponentModel.DataAnnotations;

namespace Yazlab2.Entities
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; } // Yorum Metni [cite: 73]

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Yorumu yapan kişi
        public int UserId { get; set; }
        public User User { get; set; }

        // Yorum filme mi yapıldı?
        public int? MovieId { get; set; }
        public Movie? Movie { get; set; }

        // Yorum kitaba mı yapıldı?
        public int? BookId { get; set; }
        public Book? Book { get; set; }
    }
}