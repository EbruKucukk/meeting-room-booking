using bookingWEB.Data;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class BookingDashboardModel : PageModel
{
    private readonly AppDbContext _context;

    public BookingDashboardModel(AppDbContext context)
    {
        _context = context;
    }

    public string CurrentUser { get; set; } = string.Empty;

    public void OnGet()
    {
        var userId = HttpContext.Session.GetInt32("UserId");
        if (userId != null)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user != null)
            {
                CurrentUser = user.FullName;
            }
        }
    }
}
