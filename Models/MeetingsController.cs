using bookingWEB.Data;
using bookingWEB.Models;
using bookingWEB.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace bookingWEB.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeetingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MeetingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateMeeting([FromBody] MeetingCreateDto dto)
        {
            var userEmail = HttpContext.Session.GetString("UserEmail");
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized();

            var meeting = new Meeting
            {
                Title = dto.Title,
                RoomName = dto.RoomName,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Organizer = userEmail,
                Description = dto.Description,
                Participants = string.Join(",", dto.Participants)
            };

            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMeeting(int id, [FromBody] MeetingUpdateDto dto)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null)
                return NotFound();

            var userEmail = HttpContext.Session.GetString("UserEmail");
            if (meeting.Organizer != userEmail)
                return Forbid();

            meeting.Title = dto.Title;
            meeting.RoomName = dto.RoomName;
            meeting.StartTime = dto.StartTime;
            meeting.EndTime = dto.EndTime;
            meeting.Description = dto.Description;
            meeting.Participants = string.Join(",", dto.Participants);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMeeting(int id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null)
                return NotFound();

            var userEmail = HttpContext.Session.GetString("UserEmail");
            if (meeting.Organizer != userEmail)
                return Forbid();

            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet]
        public async Task<IActionResult> GetMeetings()
        {
            var meetings = await _context.Meetings.ToListAsync();
            return Ok(meetings);
        }
    }
}