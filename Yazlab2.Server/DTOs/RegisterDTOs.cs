using System.ComponentModel.DataAnnotations;

namespace Yazlab2.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string Username { get; set; } // Kullanıcı Adı

        [Required]
        [EmailAddress]
        public string Email { get; set; } // E-posta

        [Required]
        [MinLength(6)]
        public string Password { get; set; } // Şifre
    }
}