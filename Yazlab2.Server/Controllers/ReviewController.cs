using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Yazlab2.Data;
using Yazlab2.DTOs;
using Yazlab2.Entities;

namespace Yazlab2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewController(AppDbContext context)
        {
            _context = context;
        }

     
        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddReview([FromBody] AddReviewDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var review = new Review
            {
                UserId = userId,
                Content = request.Content,
                CreatedAt = DateTime.Now
            };

            
            if (request.TmdbId.HasValue)
            {
              
                var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == request.TmdbId.ToString());
                if (movie == null) return BadRequest("Film bulunamadı. Önce listeye eklenmeli veya detay sayfası açılmalı.");
                review.MovieId = movie.Id;
            }
           
            else if (!string.IsNullOrEmpty(request.GoogleBookId))
            {
                var book = await _context.Books.FirstOrDefaultAsync(b => b.GoogleBookId == request.GoogleBookId);
                if (book == null) return BadRequest("Kitap bulunamadı.");
                review.BookId = book.Id;
            }
            else
            {
                return BadRequest("Film veya Kitap ID'si belirtilmeli.");
            }

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok("Yorum eklendi.");
        }

    
        [HttpGet("movie/{tmdbId}")]
        public async Task<IActionResult> GetMovieReviews(int tmdbId)
        {
            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbId.ToString());
            if (movie == null) return Ok(new List<object>()); 

            return await GetReviewsResponse(r => r.MovieId == movie.Id);
        }

        
        [HttpGet("book/{googleId}")]
        public async Task<IActionResult> GetBookReviews(string googleId)
        {
            var book = await _context.Books.FirstOrDefaultAsync(b => b.GoogleBookId == googleId);
            if (book == null) return Ok(new List<object>());

            return await GetReviewsResponse(r => r.BookId == book.Id);
        }

      
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var review = await _context.Reviews.FindAsync(id);

            if (review == null) return NotFound("Yorum bulunamadı.");
            if (review.UserId != userId) return Unauthorized("Sadece kendi yorumunu silebilirsin.");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok("Yorum silindi.");
        }

       
        private async Task<IActionResult> GetReviewsResponse(System.Linq.Expressions.Expression<Func<Review, bool>> filter)
        {
            
            int? currentUserId = null;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null) currentUserId = int.Parse(userIdClaim.Value);

            var reviews = await _context.Reviews
                .Where(filter)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDisplayDto
                {
                    Id = r.Id,
                    Username = r.User.Username,
                    UserAvatar = r.User.AvatarUrl,
                    Content = r.Content,
                    Date = r.CreatedAt.ToString("dd.MM.yyyy HH:mm"),
                    IsMyReview = currentUserId.HasValue && r.UserId == currentUserId
                })
                .ToListAsync();

            return Ok(reviews);
        }
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var review = await _context.Reviews.FindAsync(id);

            if (review == null) return NotFound("Yorum bulunamadı.");

            // Güvenlik Kontrolü: Yorumu düzenleyen kişi sahibi mi?
            if (review.UserId != userId) return Unauthorized("Sadece kendi yorumunu düzenleyebilirsin.");

            review.Content = request.Content;
            // review.UpdatedAt = DateTime.Now; // İstersen tarih de güncellenebilir

            await _context.SaveChangesAsync();
            return Ok("Yorum güncellendi.");
        }
    }
}