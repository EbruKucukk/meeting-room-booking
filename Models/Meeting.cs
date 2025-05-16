using System.ComponentModel.DataAnnotations;

public class Meeting
{
    [Key]
    public int MeetingID { get; set; } // 🔁 meetingID -> MeetingID ile eşlendi

    [Required]
    [StringLength(150)]
    public string Title { get; set; }

    [Required]
    [StringLength(100)]
    public string RoomName { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required]
    [StringLength(150)]
    public string Organizer { get; set; }

    [StringLength(int.MaxValue)] // nvarchar(max) uyumu
    public string Description { get; set; }
}
