using System.ComponentModel.DataAnnotations;

namespace Yazlab2.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; } // Kullanıcı Adı [cite: 22]

        [Required]
        [EmailAddress]
        public string Email { get; set; } // E-posta [cite: 22]

        [Required]
        public string PasswordHash { get; set; } // Şifreli Şifre [cite: 22]

        public string? Bio { get; set; } // Biyografi [cite: 77]

        public string? AvatarUrl { get; set; } // Profil Resmi [cite: 33]

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // İlişkiler
        public ICollection<UserMovie> UserMovies { get; set; }
        public ICollection<UserBook> UserBooks { get; set; }
        public ICollection<Review> Reviews { get; set; }
    }
}