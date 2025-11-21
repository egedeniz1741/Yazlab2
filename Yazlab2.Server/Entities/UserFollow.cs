using System.ComponentModel.DataAnnotations.Schema;

namespace Yazlab2.Entities
{
    public class UserFollow
    {
      
        public int FollowerId { get; set; }
        public User Follower { get; set; }

       
        public int FollowingId { get; set; }
        public User Following { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}