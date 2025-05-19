using System;
using System.Collections.Generic;

namespace bookingWEB.Models.DTOs
{
    public class MeetingCreateDto
    {
        public string Title { get; set; }
        public string RoomName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }
        public List<string> Participants { get; set; }
    }


    public class MeetingUpdateDto : MeetingCreateDto
    {
        // Aynı özellikler kullanılacak
    }
}