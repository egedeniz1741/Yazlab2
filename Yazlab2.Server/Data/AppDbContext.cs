using Microsoft.EntityFrameworkCore;
using Yazlab2.Entities;

namespace Yazlab2.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<UserMovie> UserMovies { get; set; }
        public DbSet<UserBook> UserBooks { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- UserMovie (Çoka-Çok İlişki) ---
            modelBuilder.Entity<UserMovie>()
                .HasKey(um => new { um.UserId, um.MovieId }); 

            modelBuilder.Entity<UserMovie>()
                .HasOne(um => um.User)
                .WithMany(u => u.UserMovies)
                .HasForeignKey(um => um.UserId);

            modelBuilder.Entity<UserMovie>()
                .HasOne(um => um.Movie)
                .WithMany(m => m.UserMovies)
                .HasForeignKey(um => um.MovieId);

            // --- UserBook (Çoka-Çok İlişki) ---
            modelBuilder.Entity<UserBook>()
                .HasKey(ub => new { ub.UserId, ub.BookId }); 

            modelBuilder.Entity<UserBook>()
                .HasOne(ub => ub.User)
                .WithMany(u => u.UserBooks)
                .HasForeignKey(ub => ub.UserId);

            modelBuilder.Entity<UserBook>()
                .HasOne(ub => ub.Book)
                .WithMany(b => b.UserBooks)
                .HasForeignKey(ub => ub.BookId);
        }
    }
}