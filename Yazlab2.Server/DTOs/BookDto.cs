namespace Yazlab2.DTOs
{
    public class BookDto
    {
        public string Id { get; set; } // Google Books ID'si (String olur, örn: "zyTCAlFPjgYC")
        public string Title { get; set; }
        public List<string> Authors { get; set; }
        public string Description { get; set; }
        public string CoverUrl { get; set; } // Kapak Resmi
        public int PageCount { get; set; }
        public string PublishedDate { get; set; }
    }

    // Google Books API yanıtını karşılamak için yardımcı sınıflar
    public class GoogleBooksResponse
    {
        public List<GoogleBookItem> Items { get; set; }
    }

    public class GoogleBookItem
    {
        public string Id { get; set; }
        public GoogleBookVolumeInfo VolumeInfo { get; set; }
    }

    public class GoogleBookVolumeInfo
    {
        public string Title { get; set; }
        public List<string> Authors { get; set; }
        public string Description { get; set; }
        public int PageCount { get; set; }
        public string PublishedDate { get; set; }
        public GoogleBookImageLinks ImageLinks { get; set; }
    }

    public class GoogleBookImageLinks
    {
        public string Thumbnail { get; set; }
    }
}