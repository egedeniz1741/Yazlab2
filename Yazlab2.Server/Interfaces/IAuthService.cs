using Yazlab2.DTOs;
using Yazlab2.Entities;

namespace Yazlab2.Interfaces
{
    public interface IAuthService
    {
        Task<User> Register(RegisterDto request);
        Task<string> Login(LoginDto request);
        Task<bool> UserExists(string email);
    }
}