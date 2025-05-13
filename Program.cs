using bookingWEB.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Razor Pages ve DbContext servisi ekleniyor
builder.Services.AddRazorPages();
builder.Services.AddControllers(); // <-- ✅ API için gerekli
builder.Services.AddSession();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

// Hata ayıklama ve HSTS
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseSession();

app.UseAuthorization();

app.MapRazorPages();
app.MapControllers(); // <-- ✅ API endpoint'lerini aktif hale getirir

app.Run();
