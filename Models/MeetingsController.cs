using bookingWEB.Models;
using bookingWEB.Data;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class MeetingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public MeetingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetMeetings()
    {
        var meetings = _context.Meetings.ToList();
        return Ok(meetings);
    }

    [HttpPost]
    public IActionResult AddMeeting([FromBody] Meeting meeting)
    {
        _context.Meetings.Add(meeting);
        _context.SaveChanges();
        return Ok(meeting);
    }

    [HttpDelete("{meetingID}")]
    public IActionResult DeleteMeeting(int meetingID)
    {
        var meeting = _context.Meetings.Find(meetingID);
        if (meeting == null)
            return NotFound();

        _context.Meetings.Remove(meeting);
        _context.SaveChanges();
        return Ok();
    }

    // ✅ BU METOD BURADA OLMALIYDI
    [HttpPut("{id}")]
    public IActionResult UpdateMeeting(int id, [FromBody] Meeting updated)
    {
        var meeting = _context.Meetings.Find(id);
        if (meeting == null)
            return NotFound();

        meeting.Title = updated.Title;
        meeting.RoomName = updated.RoomName;
        meeting.StartTime = updated.StartTime;
        meeting.EndTime = updated.EndTime;
        meeting.Description = updated.Description;
        meeting.Organizer = updated.Organizer;

        _context.SaveChanges();
        return Ok(meeting);
    }
}
