using bookingWEB.Data;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace bookingWEB.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /api/users
        [HttpGet]
        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _context.Kullanici
                .Select(u => new { u.KullaniciId, u.AdSoyad, u.Email })
                .ToList();

            return Ok(users);
        }
    }
}
