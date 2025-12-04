using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Yazlab2.Data;
using Yazlab2.DTOs;
using Yazlab2.Entities;

namespace Yazlab2.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class InteractionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InteractionController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpPost("toggle-like")]
        public async Task<IActionResult> ToggleLike([FromBody] LikeDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            Like existingLike = null;
            Movie movie = null;
            Book book = null;

            if (request.TmdbId.HasValue)
            {
                
                movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == request.TmdbId.ToString());
                if (movie != null)
                    existingLike = await _context.Likes.FirstOrDefaultAsync(l => l.UserId == userId && l.MovieId == movie.Id);
            }
            else if (!string.IsNullOrEmpty(request.GoogleId))
            {
                book = await _context.Books.FirstOrDefaultAsync(b => b.GoogleBookId == request.GoogleId);
                if (book != null)
                    existingLike = await _context.Likes.FirstOrDefaultAsync(l => l.UserId == userId && l.BookId == book.Id);
            }

            if (existingLike != null)
            {
                
                _context.Likes.Remove(existingLike);
                await _context.SaveChangesAsync();
                return Ok(new { liked = false });
            }
            else
            {
               
                if (movie == null && book == null) return BadRequest("İçerik bulunamadı.");

                var newLike = new Like
                {
                    UserId = userId,
                    MovieId = movie?.Id,
                    BookId = book?.Id
                };
                _context.Likes.Add(newLike);
                await _context.SaveChangesAsync();
                return Ok(new { liked = true });
            }
        }
    }

    public class LikeDto
    {
        public int? TmdbId { get; set; }
        public string? GoogleId { get; set; }
    }
}