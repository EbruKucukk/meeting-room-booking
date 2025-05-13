using bookingWEB.Models;
using Microsoft.EntityFrameworkCore;

namespace bookingWEB.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Kullanici> Kullanici { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
    }
}
