namespace Yazlab2.Entities
{
    public class FeedComment
    {
        public int Id { get; set; }

       
        public int UserId { get; set; }
        public User User { get; set; }

        
        public int TargetUserId { get; set; }

        
        public int? MovieId { get; set; }
        public int? BookId { get; set; }

        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}