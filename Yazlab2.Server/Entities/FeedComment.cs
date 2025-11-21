namespace Yazlab2.Entities
{
    public class FeedComment
    {
        public int Id { get; set; }

        // Yorumu Yapan Kişi
        public int UserId { get; set; }
        public User User { get; set; }

        // Aktivitenin Sahibi (Karta konu olan kişi)
        public int TargetUserId { get; set; }

        // Hangi içerik üzerine?
        public int? MovieId { get; set; }
        public int? BookId { get; set; }

        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}