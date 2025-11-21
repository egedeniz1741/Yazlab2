using Microsoft.AspNetCore.Mvc;
using Yazlab2.DTOs;
using Yazlab2.Interfaces;

namespace Yazlab2.Controllers
{
    [Route("api/[controller]")] 
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto request)
        {
          
            if (await _authService.UserExists(request.Email))
            {
                return BadRequest("Bu e-posta adresi zaten kullanımda.");
            }

            var result = await _authService.Register(request);
            return Ok(new { message = "Kayıt başarılı", userId = result.Id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto request)
        {
            var result = await _authService.Login(request);

           
            if (result == "Kullanıcı bulunamadı." ||
                result == "Şifre hatalı." ||
                result.StartsWith("Lütfen önce")) 
            {
             
               
                return BadRequest(result);
            }

      
            return Ok(new { token = result });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto request)
        {
            var result = await _authService.VerifyEmail(request.Token, request.Email);
            if (!result)
            {
                return BadRequest("Doğrulama başarısız. Geçersiz link.");
            }
            return Ok("E-posta başarıyla doğrulandı! Giriş yapabilirsiniz.");
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            
            var result = await _authService.ForgotPassword(request.Email);

            
            if (!result)
            {
                return BadRequest("Bu e-posta adresi sistemde kayıtlı değil.");
            }

            return Ok("Şifre sıfırlama linki e-posta adresinize gönderildi.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
        {
            var result = await _authService.ResetPassword(request);
            if (!result) return BadRequest("Geçersiz link veya token.");

            return Ok("Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.");
        }

        [HttpPost("send-verification-code")]
        public async Task<IActionResult> SendCode([FromBody] ForgotPasswordDto request) 
        {
            var result = await _authService.SendVerificationCodeToEmail(request.Email);
            if (!result) return BadRequest("Bu e-posta zaten kayıtlı veya gönderim hatası.");

            return Ok("Doğrulama kodu gönderildi.");
        }
    }
}