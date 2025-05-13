async function fetchMeetingsFromApi(fetchInfo, successCallback, failureCallback) {
    try {
        const res = await fetch('/api/meetings');
        const data = await res.json();

        const events = data.map(m => ({
            id: m.id,
            title: `${m.title} - ${m.roomName}`,
            start: m.startTime,
            end: m.endTime,
            extendedProps: { organizer: m.organizer }
        }));

        successCallback(events);
    } catch (err) {
        console.error("API'den veriler alınamadı", err);
        failureCallback(err);
    }
}

async function createMeetingInApi(meetingData) {
    await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData)
    });
}
