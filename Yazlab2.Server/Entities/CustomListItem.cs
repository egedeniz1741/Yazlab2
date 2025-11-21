namespace Yazlab2.Entities
{
    public class CustomListItem
    {
        public int Id { get; set; }

        public int CustomListId { get; set; }
        public CustomList CustomList { get; set; }

        
        public int? MovieId { get; set; }
        public Movie? Movie { get; set; }

        public int? BookId { get; set; }
        public Book? Book { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.Now;
    }
}