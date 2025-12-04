
using System.ComponentModel.DataAnnotations;

public class UpdateReviewDto
{
    [Required]
    [MinLength(3)]
    public string Content { get; set; }
}