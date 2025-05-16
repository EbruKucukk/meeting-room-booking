using bookingWEB.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Razor Pages aktif
builder.Services.AddRazorPages();

// 🔹 Authentication + Authorization (Cookie ile)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login"; // Giriş yapılmamışsa buraya yönlendir
        options.AccessDeniedPath = "/AccessDenied"; // Yetki yoksa buraya yönlendir
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
    });

builder.Services.AddAuthorization();

// 🔹 Veritabanı bağlantısı (senin yapına göre)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 Session middleware (eğer session kullanıyorsan)
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Hata yönetimi
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Middleware sıralaması
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();  // ⬅️ Giriş kontrolü burada başlar
app.UseAuthorization();   // ⬅️ Yetki kontrolü burada işlenir

app.UseSession();         // (opsiyonel: eğer session kullanıyorsan)

app.MapRazorPages();
app.MapControllers();     // API endpoint'leri için (örn: /api/meetings)

app.Run();
