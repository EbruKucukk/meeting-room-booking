using bookingWEB.Data;
using bookingWEB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // 🔍 GET: api/meetings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Meeting>>> GetMeetings()
        {
            return await _context.Meetings.ToListAsync();
        }

        // 🔍 GET: api/meetings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Meeting>> GetMeeting(int id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null)
                return NotFound();
            return Ok(meeting);
        }

        // ➕ POST: api/meetings
        [HttpPost]
        public async Task<ActionResult<Meeting>> CreateMeeting([FromBody] Meeting meeting)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string insertQuery = $@"
                INSERT INTO Meetings (Title, RoomName, StartTime, EndTime, Organizer, Description)
                VALUES (@p0, @p1, @p2, @p3, @p4, @p5);
            ";

            await _context.Database.ExecuteSqlRawAsync(insertQuery,
                meeting.Title,
                meeting.RoomName,
                meeting.StartTime,
                meeting.EndTime,
                meeting.Organizer,
                meeting.Description ?? "");

            return Ok("Toplantı başarıyla eklendi.");
        }

        // ✏️ PUT: api/meetings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMeeting(int id, [FromBody] Meeting updated)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string updateQuery = $@"
                UPDATE Meetings
                SET Title = @p0,
                    RoomName = @p1,
                    StartTime = @p2,
                    EndTime = @p3,
                    Organizer = @p4,
                    Description = @p5
                WHERE meetingID = @p6;
            ";

            int affected = await _context.Database.ExecuteSqlRawAsync(updateQuery,
                updated.Title,
                updated.RoomName,
                updated.StartTime,
                updated.EndTime,
                updated.Organizer,
                updated.Description ?? "",
                id);

            if (affected == 0)
                return NotFound();

            return Ok("Toplantı güncellendi.");
        }

        // ❌ DELETE: api/meetings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMeeting(int id)
        {
            string deleteQuery = "DELETE FROM Meetings WHERE meetingID = @p0";
            int affected = await _context.Database.ExecuteSqlRawAsync(deleteQuery, id);

            if (affected == 0)
                return NotFound();

            return Ok("Toplantı silindi.");
        }
    }
}