using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace bookingWEB.Models
{
    [Table("Meetings")]
    public class Meeting
    {
        [Key]
        public int meetingID { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string RoomName { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        public string Organizer { get; set; }

        public string? Description { get; set; }
    }
}
