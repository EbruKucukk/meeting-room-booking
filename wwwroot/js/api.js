// 📅 Tüm toplantıları API'den al
async function fetchMeetingsFromApi(fetchInfo, successCallback, failureCallback) {
    try {
        const res = await fetch('/api/meetings', {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("API isteği başarısız:", errText);
            failureCallback("API hatası");
            return;
        }

        const contentType = res.headers.get("Content-Type") || "";
        if (!contentType.includes("application/json")) {
            console.warn("JSON olmayan yanıt:", contentType);
            failureCallback("Yanıt JSON değil");
            return;
        }

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
        console.error("Toplantılar alınamadı:", err);
        failureCallback("Toplantılar alınamadı");
    }
}

// 🆕 Yeni toplantı oluştur
async function createMeetingInApi(meetingData) {
    try {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meetingData)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Toplantı eklenemedi:", error);
            alert("Toplantı eklenemedi: " + error);
        } else {
            console.log("Toplantı başarıyla eklendi!");
        }
    } catch (err) {
        console.error("API hatası:", err);
        alert("Toplantı oluşturulurken hata oluştu.");
    }
}

// 🔁 Toplantıyı güncelle
async function updateMeetingInApi(id, updatedData) {
    try {
        const response = await fetch(`/api/meetings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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
            credentials: 'include'
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
