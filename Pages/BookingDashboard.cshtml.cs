using bookingWEB.Data;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

[Authorize]
public class BookingDashboardModel : PageModel
{
    private readonly AppDbContext _context;

    public BookingDashboardModel(AppDbContext context)
    {
        _context = context;
    }

    public string CurrentUser { get; set; } = "Misafir";

    public void OnGet()
    {
        var userId = HttpContext.Session.GetInt32("UserId");

        if (userId != null)
        {
            var user = _context.Kullanici.FirstOrDefault(u => u.KullaniciId == userId);
            if (user != null)
            {
                CurrentUser = user.AdSoyad;
                return;
            }
        }

        // Yedek: Eðer session’da kullanýcý yoksa Claims’ten dene
        if (User.Identity.IsAuthenticated)
        {
            CurrentUser = User.Identity.Name ?? "Misafir";
        }
    }
}
