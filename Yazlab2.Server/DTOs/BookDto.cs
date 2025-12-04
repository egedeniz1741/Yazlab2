namespace Yazlab2.DTOs
{
    public class BookDto
    {
        public string Id { get; set; } 
        public string Title { get; set; }
        public List<string> Authors { get; set; }
        public string Description { get; set; }
        public string CoverUrl { get; set; } 
        public int PageCount { get; set; }
        public string PublishedDate { get; set; }
    }

  
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