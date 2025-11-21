namespace Yazlab2.DTOs
{
    // Liste Oluştururken
    public class CreateListDto
    {
        public string Name { get; set; }
    }

    // Listeye Öğe Eklerken
    public class AddItemDto
    {
        public int ListId { get; set; }
        public int? TmdbId { get; set; } // Film ise
        public string? GoogleId { get; set; } // Kitap ise
    }

    // Listeleri Görüntülerken (Profilde)
    public class CustomListDisplayDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ItemCount { get; set; } // İçindeki eleman sayısı
        // Kapak resmi olarak ilk 3 filmin/kitabın resmini gösterebiliriz (Frontend'de)
        public List<string> Thumbnails { get; set; }
    }
}