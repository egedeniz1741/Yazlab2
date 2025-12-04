using System.ComponentModel.DataAnnotations;

namespace Yazlab2.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; } 

        [Required]
        [EmailAddress]
        public string Email { get; set; } 

        [Required]
        public string PasswordHash { get; set; } 

        public string? Bio { get; set; } 

        public string? AvatarUrl { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public string? VerificationToken { get; set; } 
        public bool IsVerified { get; set; } = false;

        
        public ICollection<UserMovie> UserMovies { get; set; }
        public ICollection<UserBook> UserBooks { get; set; }
        public ICollection<Review> Reviews { get; set; }
    }
}