using bookingWEB.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Linq;

namespace bookingWEB.Pages
{
    public class BookingDashboardModel : PageModel
    {
        private readonly AppDbContext _context;

        public BookingDashboardModel(AppDbContext context)
        {
            _context = context;
        }

        public string CurrentUser { get; set; } = "Misafir";         // Ad Soyad
        public string CurrentUserEmail { get; set; } = "";           // E-posta

        public IActionResult OnGet()
        {
            Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
            Response.Headers["Pragma"] = "no-cache";
            Response.Headers["Expires"] = "-1";

            var userEmail = HttpContext.Session.GetString("UserEmail");

            if (string.IsNullOrEmpty(userEmail))
            {
                return RedirectToPage("/Login");
            }

            var user = _context.Kullanici.FirstOrDefault(u => u.Email == userEmail);
            if (user == null)
            {
                return RedirectToPage("/Login");
            }

            CurrentUser = user.AdSoyad;
            CurrentUserEmail = user.Email;

            return Page();
        }
    }
}
