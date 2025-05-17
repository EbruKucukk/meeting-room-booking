using bookingWEB.Data;
using bookingWEB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        // GET: api/meetings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Meeting>>> GetMeetings()
        {
            var userEmail = HttpContext.Session.GetString("UserEmail");
            if (string.IsNullOrEmpty(userEmail)) return Unauthorized();

            var meetings = await _context.Meetings
                .Where(m => m.Organizer == userEmail || m.Participants.Contains(userEmail))
                .ToListAsync();

            return Ok(meetings);
        }

        // GET: api/meetings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Meeting>> GetMeeting(int id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null) return NotFound();
            return Ok(meeting);
        }

        // POST: api/meetings
        [HttpPost]
        public async Task<ActionResult<Meeting>> CreateMeeting([FromBody] Meeting meeting)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var organizerEmail = HttpContext.Session.GetString("UserEmail");
            if (string.IsNullOrEmpty(organizerEmail))
                return Unauthorized();

            meeting.Organizer = organizerEmail;
            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMeeting), new { id = meeting.MeetingID }, meeting);
        }

        // PUT: api/meetings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMeeting(int id, [FromBody] Meeting updated)
        {
            if (id != updated.MeetingID)
                return BadRequest("ID uyuşmuyor.");

            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null)
                return NotFound();

            meeting.Title = updated.Title;
            meeting.RoomName = updated.RoomName;
            meeting.StartTime = updated.StartTime;
            meeting.EndTime = updated.EndTime;
            meeting.Description = updated.Description;
            meeting.Participants = updated.Participants;
            // Organizer bilgisi güncellenmemeli!

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/meetings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMeeting(int id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null)
                return NotFound();

            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
