document.addEventListener('DOMContentLoaded', async function () {
    let monthLabelRendered = false;

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

        events: fetchMeetingsFromApi,

        dateClick: (info) => openCreateModal(info, info.jsEvent),
        eventClick: (info) => showEventModal(info),

        eventDidMount: function (info) {
            const el = info.el;
            const event = info.event;
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
                requestAnimationFrame(() => tooltip.style.opacity = "1");
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
                openEditModal(event);
            });
        },

        dayCellDidMount: function (info) {
            if (monthLabelRendered) return;

            setTimeout(() => {
                const dayNumber = info.el.querySelector('.fc-daygrid-day-number')?.textContent?.trim();

                const calendarMonth = info.view.currentStart.getMonth();
                const calendarYear = info.view.currentStart.getFullYear();

                const cellMonth = info.date.getMonth();
                const cellYear = info.date.getFullYear();

                const isFirstDayOfMonth = dayNumber === "1";
                const centerDate = info.view.calendar.getDate(); // Bu doğru merkez tarihi verir
                const isVisibleMonth = info.date.getMonth() === centerDate.getMonth() && info.date.getFullYear() === centerDate.getFullYear();

                if (isFirstDayOfMonth && isVisibleMonth) {
                    const badge = document.createElement("div");
                    badge.className = "month-label first";
                    badge.textContent = info.date.toLocaleDateString('tr-TR', { month: 'long' }).toUpperCase();
                    info.el.prepend(badge);
                    monthLabelRendered = true;
                }
            }, 10);
        }
    });

    calendar.on('datesSet', () => {
        monthLabelRendered = false;
    });

    calendar.render();
    window.bookingCalendar = calendar;

    // 👇 Bu kısmı dışarı aldık
    const calendarWrapper = document.querySelector('#calendarView');
    calendarWrapper.addEventListener('wheel', function (e) {
        const view = window.bookingCalendar.view;
        if (view.type !== "dayGridMonth") return;

        e.preventDefault();
        if (e.deltaY < 0) {
            window.bookingCalendar.prev();
        } else {
            window.bookingCalendar.next();
        }
    }, { passive: false });
});
