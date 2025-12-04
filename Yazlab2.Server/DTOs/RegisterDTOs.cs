using System.ComponentModel.DataAnnotations;

namespace Yazlab2.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string Username { get; set; }
        [Required, EmailAddress]
        public string Email { get; set; }
        [Required, MinLength(6)]
        public string Password { get; set; }

        [Required, Compare("Password")] 
        public string ConfirmPassword { get; set; }

        public string? VerificationCode { get; set; }
    }
}