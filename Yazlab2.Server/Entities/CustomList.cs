namespace Yazlab2.Entities
{
    public class CustomList
    {
        public int Id { get; set; }
        public string Name { get; set; } // Listenin Adı
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Listenin Sahibi
        public int UserId { get; set; }
        public User User { get; set; }

        // Listenin İçeriği
        public ICollection<CustomListItem> Items { get; set; }
    }
}