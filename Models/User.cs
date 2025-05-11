using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace bookingWEB.Models
{
    [Table("Kullanici")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("KullaniciId")]
        public int Id { get; set; }

        [Required]
        [Column("AdSoyad")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [Column("Email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("SifreHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("KayitTarihi")]
        public DateTime? CreatedAt { get; set; }
    }
}