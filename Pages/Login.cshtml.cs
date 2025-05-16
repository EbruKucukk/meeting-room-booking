using bookingWEB.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            if (!ModelState.IsValid)
                return Page();

            var hashedPassword = HashPassword(Password);

            var user = await _context.Kullanici
                .FirstOrDefaultAsync(u => u.Email == Email && u.SifreHash == hashedPassword);

            if (user == null)
            {
                ErrorMessage = "Lütfen bilgilerinizi kontrol edin.";
                return Page();
            }

            // ✅ Kullanıcı kimliği oluşturuluyor
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.AdSoyad),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            // ✅ Kimlik cookie olarak yazılıyor
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            // 🧭 Giriş başarılı, yönlendir
            return Redirect(returnUrl ?? "/BookingDashboard");
        }

        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
