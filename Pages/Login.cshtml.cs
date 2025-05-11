using bookingWEB.Data;
using bookingWEB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Cryptography;
using System.Text;

namespace bookingWEB.Pages
{
    public class LoginModel : PageModel
    {
        private readonly AppDbContext _context;

        public LoginModel(AppDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public string Email { get; set; } = string.Empty;

        [BindProperty]
        public string Password { get; set; } = string.Empty;

        public string? ErrorMessage { get; set; }

        public void OnGet()
        {
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
                return Page();

            var hashedPassword = HashPassword(Password);

            var user = _context.Users.FirstOrDefault(u =>
                u.Email == Email && u.PasswordHash == hashedPassword);

            if (user == null)
            {
                ErrorMessage = "Lütfen bilgilerinizi kontrol edin.";
                return Page();
            }
            HttpContext.Session.SetInt32("UserId", user.Id); // veya user.KullaniciId

            // Baþarýlý giriþ
            return RedirectToPage("/BookingDashboard");
        }

        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
