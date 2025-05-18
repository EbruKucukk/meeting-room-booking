using bookingWEB.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Razor Pages ve Controller desteği
builder.Services.AddRazorPages();
builder.Services.AddControllers(); // <== Controller'lar için şart

// 🔹 Cookie tabanlı kimlik doğrulama
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login";
        options.AccessDeniedPath = "/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax; // ⬅️ local ortamda sorun yaşamamak için
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // ⬅️ localhost için güvenli
    });

builder.Services.AddAuthorization();

// 🔹 Veritabanı bağlantısı
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 Session (isteğe bağlı)
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.Cookie.SameSite = SameSiteMode.Lax; // cross-origin sıkıntısını önler

});
builder.Services.AddHttpContextAccessor(); // session'ı controller'da kullanmak için
var app = builder.Build();

// 🔸 Production error handling
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// ✅ DOĞRU SIRALAMA ÇOK ÖNEMLİ
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseSession(); // Eğer kullanıyorsan bu middleware burada olmalı

app.UseAuthentication(); // ➕ Cookie doğrulama burada aktifleşir
app.UseAuthorization();  // ➕ Yetki kontrolü burada yapılır

app.MapRazorPages();     // Razor Pages için
app.MapControllers();    // API Controller'lar için

app.Run();