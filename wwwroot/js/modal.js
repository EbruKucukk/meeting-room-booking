function sanitize(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 📅 Yeni toplantı oluşturma modalı
function openCreateModal(info, jsEvent) {
    document.querySelectorAll('.modal-floating').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'modal-floating';

    // Ekran ortasında göster
    Object.assign(modal.style, {
        position: 'absolute',
        width: '500px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 0 30px rgba(0,0,0,0.2)',
        padding: '24px',
        zIndex: 9999,
        opacity: '0',
        transform: 'scale(0.95)',
        transition: 'opacity 0.2s ease, transform 0.2s ease'
    });

    document.body.appendChild(modal);

    // Konumlandırma
    requestAnimationFrame(() => {
        const { width, height } = modal.getBoundingClientRect();
        const margin = 16;
        let left = jsEvent.pageX + margin;
        let top = jsEvent.pageY + margin;

        // Sağdan taşarsa sola kaydır
        if (left + width > window.innerWidth - margin) {
            left = jsEvent.pageX - width - margin;
        }

        // Aşağıdan taşarsa yukarı kaydır
        if (top + height > window.innerHeight - margin) {
            top = jsEvent.pageY - height - margin;
        }

        // Uygula
        modal.style.left = `${Math.max(margin, left)}px`;
        modal.style.top = `${Math.max(margin, top)}px`;
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    });


    modal.innerHTML = `
        <div class="modal-content">
            <h2>Yeni Toplantı</h2>
            <form id="createForm">
                <label>Konu:</label>
                <input name="title" required />

                <label>Oda Adı:</label>
                <input name="roomName" required />

                <input type="hidden" name="selectedDate" value="${info.dateStr}" />
                <label>Saat:</label>
                <input type="time" name="selectedTime" required />

                <label>Bitiş Saati:</label>
                <input type="time" name="endTime" required />

                <label>Organizatör:</label>
                <select id="organizerSelect" name="organizer" required>
                    <option value="">Seçiniz</option>
                </select>

                <label>Açıklama:</label>
                <textarea name="description" rows="4">Opsiyonel</textarea>

                <div class="modal-actions">
                    <button type="submit">Kaydet</button>
                    <button type="button" onclick="this.closest('.modal-floating').remove()">İptal</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    loadOrganizers();

    modal.querySelector('#createForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        const start = `${data.selectedDate}T${data.selectedTime}`;
        const end = `${data.selectedDate}T${data.endTime}`;
        if (start >= end) {
            alert("Bitiş saati başlangıç saatinden sonra olmalıdır.");
            return;
        }

        const meetingData = {
            title: data.title,
            roomName: data.roomName,
            startTime: start,
            endTime: end,
            organizer: data.organizer,
            description: data.description
        };

        await createMeetingInApi(meetingData);
        modal.remove();
        window.bookingCalendar.refetchEvents();
    });

    modal.querySelector('textarea[name="description"]').addEventListener('focus', function () {
        if (this.value === 'Opsiyonel') this.value = '';
    });
}

function loadOrganizers() {
    const select = document.getElementById("organizerSelect");
    if (!select) return;

    fetch("/api/kullanici")
        .then(res => res.json())
        .then(users => {
            select.innerHTML = '<option value="">Seçiniz</option>';
            users.forEach(user => {
                const option = document.createElement("option");
                option.value = user.email;
                option.textContent = `${user.adSoyad} (${user.email})`;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Organizatörler alınamadı:", err);
        });
}

// 📆 Toplantı düzenleme modalı
function openEditModal(event) {
    document.querySelectorAll('.modal-floating').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'modal-floating';

    const toLocalDatetimeString = (dt) => {
        const offset = dt.getTimezoneOffset() * 60000;
        return new Date(dt - offset).toISOString().slice(0, 16);
    };

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Toplantıyı Düzenle</h2>
            <form id="editForm">
                <label>Konu:</label>
                <input name="title" value="${sanitize(event.title.split(' - ')[0])}" required />

                <label>Oda Adı:</label>
                <input name="roomName" value="${sanitize(event.extendedProps.roomName)}" required />

                <label>Başlangıç:</label>
                <input type="datetime-local" name="startTime" value="${toLocalDatetimeString(event.start)}" required />

                <label>Bitiş:</label>
                <input type="datetime-local" name="endTime" value="${event.end ? toLocalDatetimeString(event.end) : ''}" required />

                <label>Düzenleyen:</label>
                <select name="organizer" id="editOrganizerSelect" required>
                    <option value="${event.extendedProps.organizer}">${sanitize(event.extendedProps.organizer)}</option>
                </select>

                <label>Açıklama:</label>
                <textarea name="description" rows="4">${sanitize(event.extendedProps.description || '')}</textarea>

                <div class="modal-actions">
                    <button type="submit">Güncelle</button>
                    <button type="button" onclick="this.closest('.modal-floating').remove()">İptal</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    fetch('/api/kullanici')
        .then(res => res.json())
        .then(users => {
            const select = modal.querySelector('#editOrganizerSelect');
            select.innerHTML = '';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.email;
                option.textContent = `${user.adSoyad} (${user.email})`;
                if (user.email === event.extendedProps.organizer) option.selected = true;
                select.appendChild(option);
            });
        });

    modal.querySelector('#editForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const updatedMeeting = {
            title: formData.get("title"),
            roomName: formData.get("roomName"),
            startTime: formData.get("startTime"),
            endTime: formData.get("endTime"),
            organizer: formData.get("organizer"),
            description: formData.get("description")
        };

        await updateMeetingInApi(event.id, updatedMeeting);
        modal.remove();
        window.bookingCalendar.refetchEvents();
    });
}

window.openEditModal = openEditModal;