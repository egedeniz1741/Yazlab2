namespace Yazlab2.DTOs
{
    public class SocialCommentDto
    {
    
        public string TargetUsername { get; set; }

        public int? TmdbId { get; set; }
        public string? GoogleId { get; set; }
        public string Content { get; set; }
    }
}