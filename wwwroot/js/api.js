// 📅 Tüm toplantıları API'den al
async function fetchMeetingsFromApi(fetchInfo, successCallback, failureCallback) {
    try {
        const res = await fetch('/api/meetings', {
            method: 'GET',
            credentials: 'include' // 🔐 Oturum bilgisini gönder
        });

        const data = await res.json();

        if (!Array.isArray(data)) {
            console.error("API'den gelen veri dizi değil:", data);
            failureCallback("Veri dizi değil");
            return;
        }

        const events = data.map(m => ({
            id: m.id,
            title: `${m.title} - ${m.roomName}`,
            start: m.startTime,
            end: m.endTime,
            extendedProps: {
                organizer: m.organizer,
                roomName: m.roomName,
                description: m.description
            }
        }));

        successCallback(events);
    } catch (err) {
        console.error("Toplantılar API'den alınamadı:", err);
        failureCallback(err);
    }
}

// 🆕 Yeni toplantı oluştur
async function createMeetingInApi(meetingData) {
    try {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 🔐 Cookie ile gönder
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
            credentials: 'include', // 🔐 Cookie ile gönder
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
            method: 'DELETE',
            credentials: 'include' // 🔐 Cookie ile gönder
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
