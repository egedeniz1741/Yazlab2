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
    public class SocialController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SocialController(AppDbContext context)
        {
            _context = context;
        }

     
        [HttpGet("search")] 
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query)) return BadRequest();

      
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var users = await _context.Users
                .Where(u => u.Username.Contains(query) && u.Id != myId)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.AvatarUrl,
                 
                    IsFollowing = _context.UserFollows.Any(f => f.FollowerId == myId && f.FollowingId == u.Id)
                })
                .ToListAsync();

            return Ok(users);
        }


        [HttpPost("follow/{id}")]
        public async Task<IActionResult> FollowUser(int id)
        {
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            if (myId == id) return BadRequest("Kendini takip edemezsin.");

            var existing = await _context.UserFollows.FindAsync(myId, id);
            if (existing != null) return BadRequest("Zaten takip ediyorsun.");

            var follow = new UserFollow { FollowerId = myId, FollowingId = id };
            _context.UserFollows.Add(follow);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Takip edildi." });
        }

        [HttpDelete("unfollow/{id}")]
        public async Task<IActionResult> UnfollowUser(int id)
        {
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var follow = await _context.UserFollows.FindAsync(myId, id);

            if (follow == null) return BadRequest("Zaten takip etmiyorsun.");

            _context.UserFollows.Remove(follow);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Takipten çıkıldı." });
        }

        [HttpGet("feed")]
        public async Task<IActionResult> GetFeed([FromQuery] int page = 1)
        {
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            int pageSize = 10;

            var followingIds = await _context.UserFollows
                .Where(f => f.FollowerId == myId)
                .Select(f => f.FollowingId)
                .ToListAsync();

            if (!followingIds.Any()) return Ok(new List<object>());

    
            var movieActivities = await _context.UserMovies
                .Where(um => followingIds.Contains(um.UserId))
                .Include(um => um.User).Include(um => um.Movie)
                .Select(um => new
                {
                    Type = "Movie",
                    ContentId = um.Movie.TmdbId,
                    User = um.User.Username,
                    UserAvatar = um.User.AvatarUrl,
                    Title = um.Movie.Title,
                    Image = um.Movie.PosterUrl,
                    Action = um.Rating.HasValue && um.Rating > 0 ? $"bir filme {um.Rating}/10 puan verdi" : "bir filmi izledi",
                    Rating = um.Rating,
                    ReviewText = (string)null, 
                    Date = um.UpdatedAt,
                    LikeCount = _context.Likes.Count(l => l.MovieId == um.Movie.Id),
                    IsLiked = _context.Likes.Any(l => l.MovieId == um.Movie.Id && l.UserId == myId)
                }).ToListAsync();

     
            var bookActivities = await _context.UserBooks
                .Where(ub => followingIds.Contains(ub.UserId))
                .Include(ub => ub.User).Include(ub => ub.Book)
                .Select(ub => new
                {
                    Type = "Book",
                    ContentId = ub.Book.GoogleBookId,
                    User = ub.User.Username,
                    UserAvatar = ub.User.AvatarUrl,
                    Title = ub.Book.Title,
                    Image = ub.Book.CoverUrl,
                    Action = ub.Rating.HasValue && ub.Rating > 0 ? $"bir kitaba {ub.Rating}/10 puan verdi" : "bir kitabı okudu",
                    Rating = ub.Rating,
                    ReviewText = (string)null,
                    Date = ub.UpdatedAt,
                    LikeCount = _context.Likes.Count(l => l.BookId == ub.Book.Id),
                    IsLiked = _context.Likes.Any(l => l.BookId == ub.Book.Id && l.UserId == myId)
                }).ToListAsync();

     
            var reviewActivities = await _context.Reviews
                .Where(r => followingIds.Contains(r.UserId))
                .Include(r => r.User)
                .Include(r => r.Movie)
                .Include(r => r.Book)
                .Select(r => new
                {
                    Type = r.MovieId != null ? "Movie" : "Book",
                    ContentId = r.MovieId != null ? r.Movie.TmdbId : r.Book.GoogleBookId,
                    User = r.User.Username,
                    UserAvatar = r.User.AvatarUrl,
                    Title = r.MovieId != null ? r.Movie.Title : r.Book.Title,
                    Image = r.MovieId != null ? r.Movie.PosterUrl : r.Book.CoverUrl,
                    Action = r.MovieId != null ? "bir filme yorum yaptı" : "bir kitaba yorum yaptı", 
                    Rating = (int?)null,
                    ReviewText = r.Content, 
                    Date = r.CreatedAt,
                    LikeCount = 0, 
                    IsLiked = false
                }).ToListAsync();

         
            var feed = movieActivities.Cast<object>()
                .Concat(bookActivities)
                .Concat(reviewActivities) 
                .OrderByDescending(x => ((dynamic)x).Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(feed);
        }
      
        [HttpPost("comment")]
        public async Task<IActionResult> AddComment([FromBody] SocialCommentDto request)
        {
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

           
            var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.TargetUsername);
            if (targetUser == null) return BadRequest("Kullanıcı bulunamadı.");

            int? movieId = null;
            int? bookId = null;

            if (request.TmdbId.HasValue)
            {
                var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == request.TmdbId.ToString());
                movieId = movie?.Id;
            }
            else if (!string.IsNullOrEmpty(request.GoogleId))
            {
                var book = await _context.Books.FirstOrDefaultAsync(b => b.GoogleBookId == request.GoogleId);
                bookId = book?.Id;
            }

            if (movieId == null && bookId == null) return BadRequest("İçerik bulunamadı.");

            var comment = new FeedComment
            {
                UserId = myId,
                TargetUserId = targetUser.Id,
                MovieId = movieId,
                BookId = bookId,
                Content = request.Content,
                CreatedAt = DateTime.Now
            };

            _context.FeedComments.Add(comment);
            await _context.SaveChangesAsync();

          
            return Ok(new
            {
                id = comment.Id,
                user = User.Identity.Name, 
               
                content = comment.Content,
                date = "Az önce"
            });
        }

        
        [HttpGet("comments")]
        public async Task<IActionResult> GetComments([FromQuery] string targetUser, [FromQuery] int? tmdbId, [FromQuery] string? googleId)
        {
            var tUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == targetUser);
            if (tUser == null) return Ok(new List<object>());

          
            var query = _context.FeedComments
                .Where(c => c.TargetUserId == tUser.Id)
                .Include(c => c.User) 
                .AsQueryable();

            if (tmdbId.HasValue)
            {
                var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbId.ToString());
                if (movie != null) query = query.Where(c => c.MovieId == movie.Id);
            }
            else if (!string.IsNullOrEmpty(googleId))
            {
                var book = await _context.Books.FirstOrDefaultAsync(b => b.GoogleBookId == googleId);
                if (book != null) query = query.Where(c => c.BookId == book.Id);
            }

            var comments = await query
                .OrderBy(c => c.CreatedAt)
                .Select(c => new
                {
                    Id = c.Id,
                    User = c.User.Username,
                    UserAvatar = c.User.AvatarUrl,
                    Content = c.Content,
                    Date = c.CreatedAt.ToString("dd.MM.yyyy HH:mm")
                })
                .ToListAsync();

            return Ok(comments);
        }
        [HttpGet("user-feed/{username}")]
        public async Task<IActionResult> GetUserFeed(string username)
        {
            var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

          
            var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (targetUser == null) return NotFound("Kullanıcı bulunamadı.");

           
            var movieActivities = await _context.UserMovies
                .Where(um => um.UserId == targetUser.Id)
                .Include(um => um.User)
                .Include(um => um.Movie)
                .Select(um => new
                {
                    Type = "Movie",
                    ContentId = um.Movie.TmdbId,
                    User = um.User.Username,
                    UserAvatar = um.User.AvatarUrl,
                    Title = um.Movie.Title,
                    Image = um.Movie.PosterUrl,
                    Action = um.Rating.HasValue && um.Rating > 0
                             ? $"bir filme {um.Rating}/10 puan verdi"
                             : (um.Status == "Watched" ? "bir filmi izledi" : "listesine ekledi"),
                    Rating = um.Rating,
                    ReviewText = (string)null, 
                    Date = um.UpdatedAt,
                    LikeCount = _context.Likes.Count(l => l.MovieId == um.Movie.Id),
                    IsLiked = _context.Likes.Any(l => l.MovieId == um.Movie.Id && l.UserId == myId)
                })
                .ToListAsync();

           
            var bookActivities = await _context.UserBooks
                .Where(ub => ub.UserId == targetUser.Id)
                .Include(ub => ub.User)
                .Include(ub => ub.Book)
                .Select(ub => new
                {
                    Type = "Book",
                    ContentId = ub.Book.GoogleBookId,
                    User = ub.User.Username,
                    UserAvatar = ub.User.AvatarUrl,
                    Title = ub.Book.Title,
                    Image = ub.Book.CoverUrl,
                    Action = ub.Rating.HasValue && ub.Rating > 0
                             ? $"bir kitaba {ub.Rating}/10 puan verdi"
                             : (ub.Status == "Read" ? "bir kitabı okudu" : "okuma listesine ekledi"),
                    Rating = ub.Rating,
                    ReviewText = (string)null,
                    Date = ub.UpdatedAt,
                    LikeCount = _context.Likes.Count(l => l.BookId == ub.Book.Id),
                    IsLiked = _context.Likes.Any(l => l.BookId == ub.Book.Id && l.UserId == myId)
                })
                .ToListAsync();

          
            var reviewActivities = await _context.Reviews
                .Where(r => r.UserId == targetUser.Id) 
                .Include(r => r.User)
                .Include(r => r.Movie)
                .Include(r => r.Book)
                .Select(r => new
                {
                    Type = r.MovieId != null ? "Movie" : "Book",
                    ContentId = r.MovieId != null ? r.Movie.TmdbId : r.Book.GoogleBookId,
                    User = r.User.Username,
                    UserAvatar = r.User.AvatarUrl,
                    Title = r.MovieId != null ? r.Movie.Title : r.Book.Title,
                    Image = r.MovieId != null ? r.Movie.PosterUrl : r.Book.CoverUrl,
                    Action = r.MovieId != null ? "bir filme yorum yaptı" : "bir kitaba yorum yaptı",
                    Rating = (int?)null,
                    ReviewText = r.Content,
                    Date = r.CreatedAt,
                    LikeCount = 0,
                    IsLiked = false
                }).ToListAsync();

            var feed = movieActivities.Cast<object>()
                .Concat(bookActivities)
                .Concat(reviewActivities) 
                .OrderByDescending(x => ((dynamic)x).Date)
                .Take(20)
                .ToList();

            return Ok(feed);
        }
    }
}