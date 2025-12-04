namespace Yazlab2.DTOs
{
  
    public class CreateListDto
    {
        public string Name { get; set; }
    }

 
    public class AddItemDto
    {
        public int ListId { get; set; }
        public int? TmdbId { get; set; } 
        public string? GoogleId { get; set; } 
    }


    public class CustomListDisplayDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ItemCount { get; set; } 
       
        public List<string> Thumbnails { get; set; }
    }
}