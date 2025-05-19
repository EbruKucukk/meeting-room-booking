function openCreateModal(info, jsEvent) {
    document.querySelectorAll('.modal-floating').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'modal-floating';

    Object.assign(modal.style, {
        position: 'absolute',
        width: '380px',
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

    modal.innerHTML = `
        <div class="modal-content">
            <div style="background:#d10000;padding:12px 16px;border-radius:12px 12px 0 0;color:white;font-weight:bold;font-size:15px">
                Yeni Toplantı
            </div>
            <form id="createForm" style="padding:20px;">
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
                <div id="katilimciContainer">
                    <div id="selectedParticipants"></div>
                    <input type="text" id="participantInput" placeholder="E-posta girin veya seçin" />
                    <div id="suggestions" class="suggestion-list"></div>
                </div>

                <label>Açıklama:</label>
                <textarea name="description" rows="4" placeholder="Açıklama (Opsiyonel)"></textarea>

                <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
                    <button type="submit" style="background:#d10000;color:white;padding:8px 16px;border:none;border-radius:6px;font-weight:600;cursor:pointer">Kaydet</button>
                    <button type="button" onclick="this.closest('.modal-floating').remove()" style="background:#eee;padding:8px 16px;border:none;border-radius:6px;font-weight:600;cursor:pointer">İptal</button>
                </div>
            </form>
        </div>
    `;

    loadParticipantsAutocomplete();
    //const tagify = new Tagify(document.querySelector('input[name=participants]'));
    function loadParticipantsAutocomplete() {
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
                user.email.toLowerCase().includes(query) && !selectedEmails.includes(user.email)
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
    modal.querySelector('#createForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        // 🛡 Çift submit'i engelle
        if (this.dataset.submitted === "true") {
            console.warn("Form zaten gönderildi.");
            return;
        }
        this.dataset.submitted = "true";

        const data = Object.fromEntries(new FormData(this).entries());
        const start = `${data.selectedDate}T${data.selectedTime}`;
        const end = `${data.selectedDate}T${data.endTime}`;

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

        console.log("🔁 GÖNDERİLEN:", meetingData);

        await createMeetingInApi(meetingData);

        modal.remove();
        window.bookingCalendar.refetchEvents();
    });

    modal.querySelector('textarea[name="description"]').addEventListener('focus', function () {
        if (this.value === 'Opsiyonel') this.value = '';
    });
}