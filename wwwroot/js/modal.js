function sanitize(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openCreateModal(info, jsEvent) {
    document.querySelectorAll('.modal-floating').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'modal-floating';

    Object.assign(modal.style, {
        position: 'absolute',
        width: '500px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        padding: '24px',
        zIndex: 9999,
        opacity: '0',
        transform: 'scale(0.95)',
        transition: 'opacity 0.2s ease, transform 0.2s ease'
    });

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        const { width, height } = modal.getBoundingClientRect();
        const margin = 16;
        let left = jsEvent.pageX + margin;
        let top = jsEvent.pageY + margin;

        if (left + width > window.innerWidth - margin) {
            left = jsEvent.pageX - width - margin;
        }
        if (top + height > window.innerHeight - margin) {
            top = jsEvent.pageY - height - margin;
        }

        modal.style.left = `${Math.min(window.innerWidth - width - margin, Math.max(margin, left))}px`;
        modal.style.top = `${Math.min(window.innerHeight - height - margin, Math.max(margin, top))}px`;
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

                <label>Katılımcılar:</label>
                <div id="katilimciContainer"></div> <!-- 🔁 Autocomplete input buraya eklenecek -->

                <label>Açıklama:</label>
                <textarea name="description" rows="4" placeholder="Açıklama (Opsiyonel)"></textarea>

                <div class="modal-actions">
                    <button type="submit">Kaydet</button>
                    <button type="button" onclick="this.closest('.modal-floating').remove()">İptal</button>
                </div>
            </form>
        </div>
    `;

    // 🔁 Partial view HTML eklendikten sonra autocomplete başlat
    const autocompleteTemplate = document.querySelector('#autocompleteTemplate');
    if (autocompleteTemplate) {
        const clone = autocompleteTemplate.cloneNode(true);
        clone.style.display = 'block';
        modal.querySelector('#katilimciContainer').appendChild(clone);
        loadParticipantsAutocomplete(); // input geldikten sonra çağır
    }

    modal.querySelector('#createForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        const start = `${data.selectedDate}T${data.selectedTime}`;
        const end = `${data.selectedDate}T${data.endTime}`;

        if (start >= end) {
            alert("Bitiş saati başlangıç saatinden sonra olmalıdır.");
            return;
        }

        const participantTags = Array.from(document.querySelectorAll('#selectedParticipants .tag'));
        const participants = participantTags.map(tag => tag.dataset.email);

        const meetingData = {
            title: data.title,
            roomName: data.roomName,
            startTime: start,
            endTime: end,
            description: data.description,
            participants: participants // artık dizi olarak gidiyor
        };

        await createMeetingInApi(meetingData);
        modal.remove();
        window.bookingCalendar.refetchEvents();
    });

    modal.querySelector('textarea[name="description"]').addEventListener('focus', function () {
        if (this.value === 'Opsiyonel') this.value = '';
    });
}

// 🔎 Katılımcı autocomplete fonksiyonu
function loadParticipantsAutocomplete() {
    const input = document.getElementById("participantInput");
    const suggestions = document.getElementById("suggestions");
    const selected = document.getElementById("selectedParticipants");

    if (!input || !suggestions || !selected) return;

    let allUsers = [];
    let selectedEmails = [];

    fetch("/api/kullanici")
        .then(res => res.json())
        .then(users => allUsers = users);

    input.addEventListener("input", function () {
        const query = this.value.trim().toLowerCase();
        suggestions.innerHTML = '';

        if (query.length < 3) {
            suggestions.style.display = "none";
            return;
        }

        const matches = allUsers.filter(user =>
            user.email.toLowerCase().startsWith(query) && !selectedEmails.includes(user.email)
        );

        if (matches.length > 0) {
            suggestions.style.display = "block";
        } else {
            suggestions.style.display = "none";
        }

        matches.forEach(user => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = `${user.adSoyad} (${user.email})`;
            div.addEventListener("click", () => addEmail(user.email));
            suggestions.appendChild(div);
        });
    });

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const email = this.value.trim();
            if (email && !selectedEmails.includes(email)) {
                addEmail(email);
            }
        }
    });

    function addEmail(email) {
        selectedEmails.push(email);

        const tag = document.createElement("span");
        tag.className = "tag";
        tag.dataset.email = email;
        tag.textContent = email;

        const close = document.createElement("button");
        close.textContent = "×";
        close.onclick = () => {
            selectedEmails = selectedEmails.filter(e => e !== email);
            tag.remove();
        };

        tag.appendChild(close);
        selected.appendChild(tag);
        input.value = '';
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
    }
}

window.openCreateModal = openCreateModal;
