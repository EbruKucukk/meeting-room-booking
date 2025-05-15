// 📅 Tüm toplantıları API'den al
async function fetchMeetingsFromApi(fetchInfo, successCallback, failureCallback) {
    try {
        const response = await fetch('/api/meetings');
        const meetings = await response.json();

        const events = meetings.map(m => ({
            id: m.id,
            title: `${m.title} - ${m.roomName}`,
            start: new Date(m.startTime).toISOString(),
            end: m.endTime ? new Date(m.endTime).toISOString() : null,
            extendedProps: {
                organizer: m.organizer,
                roomName: m.roomName,
                description: m.description
            }
        }));

        successCallback(events);
    } catch (error) {
        console.error("❌ Toplantılar API'den alınamadı:", error);
        failureCallback(error);
    }
}

// 🆕 Yeni toplantı oluştur
async function createMeetingInApi(meetingData) {
    try {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meetingData)
        });

        if (!response.ok) {
            throw new Error("Toplantı oluşturulamadı");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ createMeetingInApi hatası:", error);
    }
}

// 🔁 Toplantıyı güncelle
async function updateMeetingInApi(id, updatedData) {
    try {
        const response = await fetch(`/api/meetings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error("Toplantı güncellenemedi");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ updateMeetingInApi hatası:", error);
    }
}

// ❌ Toplantıyı sil
async function deleteMeetingFromApi(id) {
    try {
        const response = await fetch(`/api/meetings/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error("Toplantı silinemedi");
        }

        return true;
    } catch (error) {
        console.error("❌ deleteMeetingFromApi hatası:", error);
        return false;
    }
}
