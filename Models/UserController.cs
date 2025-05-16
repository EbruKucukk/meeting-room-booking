using bookingWEB.Data;
using bookingWEB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace bookingWEB.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KullaniciController : ControllerBase
    {
        private readonly AppDbContext _context;

        public KullaniciController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            var users = await _context.Kullanici
                .Select(u => new {
                    u.KullaniciId,
                    u.AdSoyad,
                    u.Email
                }).ToListAsync();

            return Ok(users);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] KullaniciRegisterDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _context.Kullanici.AnyAsync(u => u.Email == model.Email);
            if (existing)
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");

            var user = new Kullanici
            {
                AdSoyad = model.AdSoyad,
                Email = model.Email,
                SifreHash = ComputeSha256Hash(model.Sifre),
                KayitTarihi = DateTime.UtcNow
            };

            _context.Kullanici.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Kayıt başarılı");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] KullaniciLoginDTO model)
        {
            var user = await _context.Kullanici.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null || user.SifreHash != ComputeSha256Hash(model.Sifre))
                return Unauthorized("Geçersiz email veya şifre");

            return Ok(new
            {
                message = "Giriş başarılı",
                adSoyad = user.AdSoyad,
                email = user.Email
            });
        }

        private string ComputeSha256Hash(string raw)
        {
            using var sha = SHA256.Create();
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
            var sb = new StringBuilder();
            foreach (var b in bytes)
                sb.Append(b.ToString("x2"));
            return sb.ToString();
        }
    }

    public class KullaniciRegisterDTO
    {
        public string AdSoyad { get; set; }
        public string Email { get; set; }
        public string Sifre { get; set; }
    }

    public class KullaniciLoginDTO
    {
        public string Email { get; set; }
        public string Sifre { get; set; }
    }
}