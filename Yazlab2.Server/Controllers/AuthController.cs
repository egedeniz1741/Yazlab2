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

            if (result == "Kullanıcı bulunamadı." || result == "Şifre hatalı.")
            {
                return BadRequest(result);
            }

           
            return Ok(new { token = result });
        }
    }
}