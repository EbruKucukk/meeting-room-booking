using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace bookingWEB.Pages
{
    public class LogoutModel : PageModel
    {
        public IActionResult OnGet()
        {
            // ? Oturumu temizle
            HttpContext.Session.Clear();

            // ? �nbelle�i devre d��� b�rak
            Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
            Response.Headers["Pragma"] = "no-cache";
            Response.Headers["Expires"] = "-1";

            return RedirectToPage("/Login");
        }
    }
}
