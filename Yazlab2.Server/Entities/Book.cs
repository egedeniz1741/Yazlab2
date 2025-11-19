using System.ComponentModel.DataAnnotations;

namespace Yazlab2.Entities
{
    public class Book
    {
        [Key]
        public int Id { get; set; }

        public string? GoogleBookId { get; set; } // Dış API ID'si [cite: 90]

        public string Title { get; set; }
        public string? Authors { get; set; }
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public int PageCount { get; set; }

        public ICollection<UserBook> UserBooks { get; set; }
        public ICollection<Review> Reviews { get; set; }
    }
}