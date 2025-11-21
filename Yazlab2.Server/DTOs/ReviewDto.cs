using System.ComponentModel.DataAnnotations;

namespace Yazlab2.DTOs
{
    
    public class AddReviewDto
    {
       
        public int? TmdbId { get; set; }
        public string? GoogleBookId { get; set; }

        [Required]
        [MinLength(3, ErrorMessage = "Yorum çok kısa.")]
        public string Content { get; set; }
    }

    
    public class ReviewDisplayDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string UserAvatar { get; set; }
        public string Content { get; set; }
        public string Date { get; set; }
        public bool IsMyReview { get; set; } 
    }
}