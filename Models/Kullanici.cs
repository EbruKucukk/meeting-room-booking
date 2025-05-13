using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace bookingWEB.Models
{
    [Table("Kullanici")]
    public class Kullanici
    {
        [Key]
        public int KullaniciId { get; set; }

        [Required]
        public string AdSoyad { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string SifreHash { get; set; }

        public DateTime KayitTarihi { get; set; }
    }
}
