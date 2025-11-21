using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Yazlab2.Data;
using Yazlab2.Entities;

namespace Yazlab2.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        public UserController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // Profil Bilgilerini Getir (Benim veya Başkasının)
        [HttpGet("profile/{username?}")]
        public async Task<IActionResult> GetProfile(string? username = null)
        {
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            User user;

            if (string.IsNullOrEmpty(username))
            {
                // Kendi profilim
                user = await _context.Users.FindAsync(myId);
            }
            else
            {
                // Başkasının profili
                user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            }

            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            // Takip ediyor muyum?
            var isFollowing = await _context.UserFollows
                .AnyAsync(f => f.FollowerId == myId && f.FollowingId == user.Id);

            // Takipçi ve Takip Edilen sayıları
            var followersCount = await _context.UserFollows.CountAsync(f => f.FollowingId == user.Id);
            var followingCount = await _context.UserFollows.CountAsync(f => f.FollowerId == user.Id);

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Bio,
                user.AvatarUrl,
                IsMe = user.Id == myId,
                IsFollowing = isFollowing,
                FollowersCount = followersCount,
                FollowingCount = followingCount
            });
        }

        // Profil Güncelle (Bio ve Avatar)
        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
        {
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FindAsync(myId);

            if (user == null) return NotFound();

            // Boş değilse güncelle
            if (request.Bio != null) user.Bio = request.Bio;
            if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profil güncellendi.", user.AvatarUrl, user.Bio });
        }
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya seçilmedi.");

            // --- GÜVENLİ YOL BULMA (DÜZELTİLEN KISIM) ---

            // Eğer WebRootPath null gelirse (klasör yoksa), projenin ana dizinine "wwwroot" ekleyerek yolu biz türetelim.
            string webRootPath = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");

            var uploadsFolder = Path.Combine(webRootPath, "uploads");

            // Klasör fiziksel olarak yoksa oluştur
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // ---------------------------------------------

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // URL oluşturma
            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            var fileUrl = $"{baseUrl}/uploads/{uniqueFileName}";

            // DB Güncelleme
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FindAsync(myId);
            user.AvatarUrl = fileUrl;
            await _context.SaveChangesAsync();

            return Ok(new { avatarUrl = fileUrl });
        }
    }

   
    public class UpdateProfileDto
    {
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }
}