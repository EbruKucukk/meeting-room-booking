function openCreateModal(info, jsEvent) {
    // Önce tüm eski modalları kaldır
    document.querySelectorAll('.modal-floating').forEach(m => m.remove());

    const startStr = info.dateStr + "T08:00";
    const modal = document.createElement('div');
    modal.className = 'modal-floating';
    modal.style.position = 'absolute';
    modal.style.top = '0px';
    modal.style.left = '0px';
    modal.style.visibility = 'hidden'; // ölçüm için önce gizli

    // Modal içeriğini ata
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Yeni Toplantı</h2>
            <form id="createForm">
                <label>Konu:</label>
                <input name="title" required />
                
                <label>Oda Adı:</label>
                <input name="roomName" required />
                
                <label>Başlangıç Zamanı:</label>
                <input type="datetime-local" name="startTime" value="${startStr}" required />
                
                <label>Organizatör:</label>
                <select id="organizerSelect" name="organizer" required>
                    <option value="">Seçiniz</option>
                </select>
                
                <label>Açıklama:</label>
                <textarea name="description" rows="4" style="width:100%; padding:8px; border-radius:6px;">Opsiyonel</textarea>
                
                <div class="modal-actions">
                    <button type="submit">Kaydet</button>
                    <button type="button" onclick="this.closest('.modal-floating').remove()">İptal</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal); // içeriği atanmış haliyle DOM’a ekle

    // Artık güvenle textarea’ya erişebilirsin
    const textarea = modal.querySelector('textarea[name="description"]');
    textarea.addEventListener('focus', function () {
        if (this.value === 'Opsiyonel') this.value = '';
    });

    // Form submit
    modal.querySelector('#createForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(this).entries());

        await createMeetingInApi(formData);
        modal.remove();
        window.bookingCalendar.refetchEvents();
    });

    // Kullanıcıları getir
    loadOrganizers();

    // Konumlama
    requestAnimationFrame(() => {
        const modalRect = modal.getBoundingClientRect();
        const modalWidth = modalRect.width;
        const modalHeight = modalRect.height;

        let top = jsEvent.pageY;
        let left = jsEvent.pageX;

        if (top + modalHeight > window.innerHeight) top = window.innerHeight - modalHeight - 20;
        if (left + modalWidth > window.innerWidth) left = window.innerWidth - modalWidth - 20;

        modal.style.top = `${Math.max(top, 20)}px`;
        modal.style.left = `${Math.max(left, 20)}px`;
        modal.style.visibility = 'visible';
    });

    // Dış tıklama ile kapatma
    setTimeout(() => {
        document.addEventListener('click', function close(e) {
            if (!modal.contains(e.target)) {
                modal.remove();
                document.removeEventListener('click', close);
            }
        }, { once: true });
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

function showEventModal(info) {
    const { title, extendedProps, start, end } = info.event;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            <p><strong>Organizatör:</strong> ${extendedProps.organizer}</p>
            <p><strong>Başlangıç:</strong> ${start.toLocaleString('tr-TR')}</p>
            <p><strong>Bitiş:</strong> ${end.toLocaleString('tr-TR')}</p>
            <div class="modal-actions" style="margin-top: 16px;">
                <button onclick="this.closest('.modal-overlay').remove()" style="padding: 10px 18px; background-color: #aaa; border: none; border-radius: 6px;">Kapat</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
