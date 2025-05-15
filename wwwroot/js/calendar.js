document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('calendarView');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'tr',
        height: '100%',
        firstDay: 1,
        selectable: true,
        nowIndicator: true,
        timeZone: 'local',

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },

        buttonText: {
            today: 'Bugün',
            month: 'Aylık',
            week: 'Haftalık',
            day: 'Günlük'
        },

        // 📅 Toplantı verilerini yükle
        events: fetchMeetingsFromApi,

        // 🟢 Boş bir güne tıklanırsa toplantı oluşturma modalı aç
        dateClick: function (info) {
            openCreateModal(info, info.jsEvent);
        },

        // 🔵 Etkinliğe tek tıklanınca bilgi modalı aç
        eventClick: function (info) {
            showEventModal(info);
        },

        // 🟣 Etkinlik eklendikten sonra tooltip ve çift tıklama tanımlamaları yapılır
        eventDidMount: function (info) {
            const event = info.event;
            const el = info.el;
            let tooltip;

            el.addEventListener("mouseenter", (e) => {
                tooltip = document.createElement("div");
                tooltip.className = "modern-tooltip";

                tooltip.innerHTML = `
            <div class="tooltip-card">
                <div class="tooltip-title">${event.title || 'Etkinlik'}</div>
                <div class="tooltip-row"><b>Başlangıç:</b> ${event.start?.toLocaleString('tr-TR') || '-'}</div>
                <div class="tooltip-row"><b>Bitiş:</b> ${event.end?.toLocaleString('tr-TR') || '-'}</div>
                <div class="tooltip-row"><b>Düzenleyen:</b> ${event.extendedProps?.organizer || '-'}</div>
                <div class="tooltip-row"><b>Konum:</b> ${event.extendedProps?.roomName || '-'}</div>
                <div class="tooltip-row"><b>Açıklama:</b> ${event.extendedProps?.description || '-'}</div>
            </div>
        `;

                document.body.appendChild(tooltip);

                tooltip.style.position = "absolute";
                tooltip.style.left = `${e.pageX + 12}px`;
                tooltip.style.top = `${e.pageY + 12}px`;
                tooltip.style.opacity = "0";
                tooltip.style.transition = "opacity 0.2s ease";

                requestAnimationFrame(() => {
                    tooltip.style.opacity = "1";
                });
            });

            el.addEventListener("mousemove", (e) => {
                if (tooltip) {
                    tooltip.style.left = `${e.pageX + 12}px`;
                    tooltip.style.top = `${e.pageY + 12}px`;
                }
            });

            el.addEventListener("mouseleave", () => {
                if (tooltip) {
                    tooltip.remove();
                    tooltip = null;
                }
            });
            el.addEventListener("dblclick", (e) => {
                e.preventDefault();
                openEditModal(event); // ✅ BU SATIR ÇALIŞACAK
            });
        }
    });

    calendar.render();

    // Global erişim için takvimi dışa aktar
    window.bookingCalendar = calendar;
});
