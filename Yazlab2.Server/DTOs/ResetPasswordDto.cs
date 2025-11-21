using System.ComponentModel.DataAnnotations;

namespace Yazlab2.DTOs
{
    public class ResetPasswordDto
    {
        public string Token { get; set; }
        public string Email { get; set; }
        [Required, MinLength(6)]
        public string NewPassword { get; set; }
        [Required, Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; }
    }
}