window.selectedUsers = window.selectedUsers || [];

function attachModalCloseOnOutside(modal) {
    setTimeout(() => {
        document.addEventListener('mousedown', function handleOutsideClick(event) {
            if (!modal.contains(event.target)) {
                modal.remove();
                document.removeEventListener('mousedown', handleOutsideClick);
            }
        });
    }, 10);
}
function openCreateModal(info, jsEvent) {
    removeExistingModals();

    const modal = createModalContainer(jsEvent, 380);

    modal.innerHTML = `
<div class="modal-content">
    <div style="background:#d10000;padding:12px 16px;border-radius:12px 12px 0 0;color:white;font-weight:bold;font-size:15px">
        Yeni Toplantı
    </div>
    <form id="createForm" style="padding:20px;">
        <label for="title">Konu:</label>
        <input type="text" id="title" name="title" required />

        <label for="roomName">Oda Adı:</label>
        <input type="text" id="roomName" name="roomName" required />

        <input type="hidden" name="selectedDate" value="${info.dateStr}" />

        <label for="selectedTime">Saat:</label>
        <input type="time" id="selectedTime" name="selectedTime" required />

        <label for="endTime">Bitiş Saati:</label>
        <input type="time" id="endTime" name="endTime" required />

        <label for="participantInput">Katılımcılar:</label>
        <div id="katilimciContainer">
            <div id="selectedParticipants"></div>
            <input type="text" id="participantInput" placeholder="E-posta girin veya seçin" />
            <div id="suggestions" class="suggestion-list"></div>
        </div>

        <label for="description">Açıklama:</label>
        <textarea id="description" name="description" placeholder="Açıklama (Opsiyonel)"></textarea>

        <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
            <button type="submit" style="background:#d10000;color:white;padding:8px 16px;border:none;border-radius:6px;font-weight:600;cursor:pointer">Kaydet</button>
            <button type="button" onclick="this.closest('.modal-floating').remove()" style="background:#eee;padding:8px 16px;border:none;border-radius:6px;font-weight:600;cursor:pointer">İptal</button>
        </div>
    </form>
</div>
`;


    loadParticipantsAutocomplete(modal);

    modal.querySelector('#createForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        if (this.dataset.submitted === "true") {
            console.warn("Form zaten gönderildi.");
            return;
        }
        this.dataset.submitted = "true";

        const data = Object.fromEntries(new FormData(this).entries());
        const start = new Date(`${data.selectedDate}T${data.selectedTime}`).toISOString();
        const end = new Date(`${data.selectedDate}T${data.endTime}`).toISOString();

        if (start >= end) {
            alert("Bitiş saati başlangıç saatinden sonra olmalıdır.");
            return;
        }

        const participantTags = Array.from(modal.querySelectorAll('#selectedParticipants .tag'));
        const participants = participantTags.map(tag => tag.dataset.email);

        const meetingData = {
            title: data.title,
            roomName: data.roomName,
            startTime: start,
            endTime: end,
            organizer: window.loggedInUser || "",
            description: data.description,
            participants
        };

        await createMeetingInApi(meetingData);

        modal.remove();
        window.bookingCalendar.refetchEvents();
    });
    attachModalCloseOnOutside(modal);
}


function openUserSearchModal(jsEvent) {
    removeExistingModals();
    const modal = createModalContainer(jsEvent, 400);

    modal.innerHTML = `
    <div class="modal-content">
        <div style="background:#d10000;padding:12px 16px;border-radius:12px 12px 0 0;
                    color:white;font-weight:bold;font-size:15px; display:flex; align-items:center; gap:8px;">
            <span>👥</span> Kişi Arama
        </div>
        <div id="katilimciContainer" style="padding:20px;">
            <div id="selectedParticipants"></div>
            <input type="text" id="participantInput" placeholder="E-posta girin veya seçin" />
            <div id="suggestions" class="suggestion-list"></div>

            <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:8px">
                <button onclick="this.closest('.modal-floating').remove()"
                        style="background:#eee;padding:8px 16px;border:none;border-radius:6px;font-weight:600;cursor:pointer">
                    İptal
                </button>
                <button id="addCalendarUserBtn"
        style="background:#d10000;color:white;padding:8px 16px;border:none;border-radius:6px;font-weight:600;cursor:pointer">
    Ekle
</button>

            </div>
        </div>
    </div>
    `;

    document.getElementById("addCalendarUserBtn").addEventListener("click", () => {
        const tags = modal.querySelectorAll("#selectedParticipants .tag");

        tags.forEach(tag => {
            const email = tag.dataset.email;

            if (!window.selectedUsers) window.selectedUsers = [];
            if (!window.selectedUsers.includes(email) && email !== window.loggedInUser) {
                window.selectedUsers.push(email);
            }
        });

        if (window.bookingCalendar) {
            window.bookingCalendar.refetchEvents();
        }

        modal.remove();
    });

    loadParticipantsAutocomplete(modal);

    // 🔁 Mevcut filtreleri tekrar göster
    const selectedDiv = modal.querySelector("#selectedParticipants");
    window.selectedUsers.forEach(email => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.dataset.email = email;
        tag.textContent = email;

        const close = document.createElement("button");
        close.textContent = "×";
        close.onclick = () => {
            window.selectedUsers = window.selectedUsers.filter(e => e !== email);
            tag.remove();
            window.bookingCalendar.refetchEvents();
        };

        tag.appendChild(close);
        selectedDiv.appendChild(tag);
    });

    attachModalCloseOnOutside(modal);
}


// ✅ Ortak modal temizleyici
function removeExistingModals() {
    document.querySelectorAll('.modal-floating').forEach(m => m.remove());
}


// ✅ Ortak modal oluşturucu
function createModalContainer(jsEvent, width) {
    const modal = document.createElement('div');
    modal.className = 'modal-floating';

    Object.assign(modal.style, {
        position: 'absolute',
        width: `${width}px`,
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        zIndex: 9999,
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease-out'
    });

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        const { width, height } = modal.getBoundingClientRect();
        const margin = 20;
        let left = jsEvent.pageX + margin;
        let top = jsEvent.pageY + margin;

        if (left + width > window.innerWidth - margin) {
            left = jsEvent.pageX - width - margin;
        }
        if (top + height > window.innerHeight - margin) {
            top = jsEvent.pageY - height - margin;
        }

        modal.style.left = `${Math.max(margin, left)}px`;
        modal.style.top = `${Math.max(margin, top)}px`;
    });

    return modal;
}


// ✅ Ortak autocomplete yükleyici
function loadParticipantsAutocomplete(modal) {
    const input = modal.querySelector("#participantInput");
    const suggestions = modal.querySelector("#suggestions");
    const selected = modal.querySelector("#selectedParticipants");

    if (!input || !suggestions || !selected) return;

    let allUsers = [];
    let selectedEmails = [];

    fetch("/api/kullanici")
        .then(res => res.json())
        .then(users => allUsers = users);

    input.addEventListener("input", function () {
        const query = this.value.trim().toLowerCase();
        suggestions.innerHTML = '';

        if (query.length < 2) {
            suggestions.style.display = "none";
            return;
        }

        const matches = allUsers.filter(user =>
            user.email.toLowerCase().includes(query) &&
            !window.selectedUsers.includes(user.email)
        );

        suggestions.style.display = matches.length > 0 ? "block" : "none";

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
        if (window.selectedUsers.includes(email)) return;

        window.selectedUsers.push(email);

        const tag = document.createElement("span");
        tag.className = "tag";
        tag.dataset.email = email;
        tag.textContent = email;

        const close = document.createElement("button");
        close.textContent = "×";
        close.onclick = () => {
            window.selectedUsers = window.selectedUsers.filter(e => e !== email);
            tag.remove();
            window.bookingCalendar.refetchEvents();
        };

        tag.appendChild(close);
        selected.appendChild(tag);
        input.value = '';
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
    }

}
function refetchCalendarWithFilters() {
    const modal = document.querySelector('.modal-floating');
    const tagElements = modal?.querySelectorAll('#selectedParticipants .tag') || [];

    window.selectedUsers = Array.from(tagElements).map(tag => tag.dataset.email);

    if (window.bookingCalendar) {
        window.bookingCalendar.refetchEvents();
    }

    removeExistingModals();
}
