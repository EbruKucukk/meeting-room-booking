function openCreateModal(info, jsEvent) {
    document.querySelectorAll('.modal-floating').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'modal-floating';
    Object.assign(modal.style, {
        position: 'fixed', width: '500px', maxWidth: '95vw', maxHeight: '90vh',
        overflowY: 'auto', background: 'white', borderRadius: '12px',
        boxShadow: '0 0 30px rgba(0,0,0,0.2)', padding: '24px', zIndex: 9999,
        opacity: '0', transform: 'translateY(-20px)', transition: 'all 0.3s ease'
    });

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Yeni Toplantı</h2>
            <form id="createForm">
                <label>Konu:</label>
                <input name="title" required style="width:100%;" />

                <label>Oda Adı:</label>
                <input name="roomName" required style="width:100%;" />

                <input type="hidden" name="selectedDate" value="${info.dateStr}" />
                <label>Saat:</label>
                <input type="time" name="selectedTime" required style="width:100%;" />

                <label>Organizatör:</label>
                <select id="organizerSelect" name="organizer" required style="width:100%;">
                    <option value="">Seçiniz</option>
                </select>

                <label>Açıklama:</label>
                <textarea name="description" rows="4" style="width:100%; padding:8px; border-radius:6px;">Opsiyonel</textarea>

                <div class="modal-actions" style="margin-top: 16px; text-align: right;">
                    <button type="submit" style="padding: 10px 16px; background: red; color: white; border: none; border-radius: 6px;">Kaydet</button>
                    <button type="button" onclick="this.closest('.modal-floating').remove()" style="padding: 10px 16px; background: #ccc; border: none; border-radius: 6px;">İptal</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    loadOrganizers();

    requestAnimationFrame(() => {
        const { width, height } = modal.getBoundingClientRect();
        let left = jsEvent.clientX, top = jsEvent.clientY, margin = 20;
        if (left + width + margin > window.innerWidth) left = window.innerWidth - width - margin;
        if (top + height + margin > window.innerHeight) top = window.innerHeight - height - margin;
        modal.style.left = `${Math.max(margin, left)}px`;
        modal.style.top = `${Math.max(margin, top)}px`;
        modal.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        document.addEventListener('click', function close(e) {
            if (!modal.contains(e.target)) {
                modal.remove();
                document.removeEventListener('click', close);
            }
        }, { once: true });
    });

    document.addEventListener('keydown', function escClose(e) {
        if (e.key === "Escape") {
            modal.remove();
            document.removeEventListener('keydown', escClose);
        }
    });
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
    const textarea = modal.querySelector('textarea[name="description"]');
    textarea.addEventListener('focus', function () {
        if (this.value === 'Opsiyonel') this.value = '';
    });
}

async function loadOrganizers() {
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const select = document.getElementById('organizerSelect');
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.email;
            option.textContent = `${user.adSoyad} (${user.email})`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Kullanıcılar yüklenemedi:", err);
    }
}
