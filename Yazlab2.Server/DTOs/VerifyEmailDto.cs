using System.ComponentModel.DataAnnotations;

namespace Yazlab2.DTOs
{
    public class VerifyEmailDto
    {
        [Required]
        public string Token { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}