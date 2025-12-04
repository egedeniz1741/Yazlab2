using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Yazlab2.Data;
using Yazlab2.DTOs;
using Yazlab2.Entities;
using Yazlab2.Interfaces;

namespace Yazlab2.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;

        public AuthService(AppDbContext context, IConfiguration configuration, IEmailService emailService, IMemoryCache cache)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _cache = cache;
        }

        public async Task<User> Register(RegisterDto request)
        {
       
            if (!_cache.TryGetValue(request.Email, out string cachedCode))
            {
                throw new Exception("Doğrulama kodu süresi dolmuş veya hatalı.");
            }

            if (cachedCode != request.VerificationCode)
            {
                throw new Exception("Girdiğiniz kod yanlış.");
            }

           
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                Bio = "Merhaba, ben yeni bir üyeyim!",
                AvatarUrl = "https://ui-avatars.com/api/?name=" + request.Username,
                IsVerified = true 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

           
            _cache.Remove(request.Email);

            return user;
        }
        public async Task<string> Login(LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null) return "Kullanıcı bulunamadı.";

         

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordValid) return "Şifre hatalı.";

            return CreateToken(user);
        }

        public async Task<bool> UserExists(string email)
        {
            return await _context.Users.AnyAsync(x => x.Email == email);
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        public async Task<bool> VerifyEmail(string token, string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || user.VerificationToken != token)
            {
                return false; 
            }

            user.IsVerified = true;
            user.VerificationToken = null; 
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> ForgotPassword(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false; 

           
            var token = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64));

           
            user.VerificationToken = token;
            await _context.SaveChangesAsync();

             http://localhost:5173/reset-password?token=...&email=...
            var resetLink = $"http://localhost:5173/reset-password?token={token}&email={email}";
            var body = $"<p>Şifreni sıfırlamak için linke tıkla:</p><a href='{resetLink}'>Şifremi Sıfırla</a>";

            _emailService.SendEmail(email, "Şifre Sıfırlama", body);
            return true;
        }
        public async Task<bool> ResetPassword(ResetPasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            
            if (user == null || user.VerificationToken != request.Token)
                return false;

            
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.VerificationToken = null; 
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SendVerificationCodeToEmail(string email)
        {
            
            if (await _context.Users.AnyAsync(u => u.Email == email)) return false;

            
            var code = new Random().Next(10000, 99999).ToString();

          
            _cache.Set(email, code, TimeSpan.FromMinutes(5));

            var body = $"<h3>Doğrulama Kodunuz</h3><h1>{code}";

            try
            {
                _emailService.SendEmail(email, "Kayıt Doğrulama Kodu", body);
                return true;
            }
            catch { return false; }
        }
    }
}