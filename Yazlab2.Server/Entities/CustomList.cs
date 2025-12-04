namespace Yazlab2.Entities
{
    public class CustomList
    {
        public int Id { get; set; }
        public string Name { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.Now;

       
        public int UserId { get; set; }
        public User User { get; set; }

        
        public ICollection<CustomListItem> Items { get; set; }
    }
}