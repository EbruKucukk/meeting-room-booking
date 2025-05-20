let selectedUsers = []; // Modalda seçilen kullanıcıların e-posta listesi
window.selectedUsers = window.selectedUsers || [];

const userColors = {};

function getUserColor(email) {
    const normalizedEmail = (email || "").toLowerCase();
    const loggedInEmail = (window.loggedInUser || "").toLowerCase();

    if (normalizedEmail === loggedInEmail) {
        return '#d10000'; // 🔴 Giriş yapan kullanıcıya sabit kırmızı
    }

    if (!userColors[normalizedEmail]) {
        userColors[normalizedEmail] = getRandomColor();
    }
    return userColors[normalizedEmail];
}

function getRandomColor() {
    const colors = [
        '#3cb44b', '#ffe119', '#4363d8',
        '#f58231', '#911eb4', '#46f0f0', '#f032e6',
        '#bcf60c', '#fabebe', '#008080', '#e6beff',
        '#9a6324', '#fffac8', '#800000', '#aaffc3',
        '#808000', '#ffd8b1', '#000075', '#808080'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

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
        fixedWeekCount: true, // 6 haftayı sabit göster
        dayMaxEventRows: true,  // 👈 bu satırı kullan
        eventDisplay: 'block',

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

        dateClick: (info) => {
            const clickedDate = info.date;
            const currentViewDate = calendar.view.currentStart;

            const clickedMonth = clickedDate.getMonth();
            const clickedYear = clickedDate.getFullYear();
            const currentMonth = currentViewDate.getMonth();
            const currentYear = currentViewDate.getFullYear();

            const isFutureMonth = clickedYear > currentYear || (clickedYear === currentYear && clickedMonth > currentMonth);
            const isPastMonth = clickedYear < currentYear || (clickedYear === currentYear && clickedMonth < currentMonth);

            if (isFutureMonth || isPastMonth) {
                calendar.gotoDate(clickedDate);
            } else {
                openCreateModal(info, info.jsEvent);
            }
        },

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
                tooltip.style.opacity = "0";
                tooltip.style.transition = "opacity 0.2s ease";

                const tooltipWidth = 380;
                const tooltipHeight = 240;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                let left = e.pageX + 16;
                let top = e.pageY + 16;

                if (left + tooltipWidth > viewportWidth - 10) {
                    left = e.pageX - tooltipWidth - 16;
                }
                if (top + tooltipHeight > viewportHeight - 10) {
                    top = e.pageY - tooltipHeight - 16;
                }

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;

                requestAnimationFrame(() => {
                    tooltip.style.opacity = "1";
                });
            });

            el.addEventListener("mousemove", (e) => {
                if (tooltip) {
                    let left = e.pageX + 16;
                    let top = e.pageY + 16;

                    const tooltipWidth = 380;
                    const tooltipHeight = 240;
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    if (left + tooltipWidth > viewportWidth - 10) {
                        left = e.pageX - tooltipWidth - 16;
                    }
                    if (top + tooltipHeight > viewportHeight - 10) {
                        top = e.pageY - tooltipHeight - 16;
                    }

                    tooltip.style.left = `${left}px`;
                    tooltip.style.top = `${top}px`;
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
        }
    });

    calendar.on('datesSet', () => {
        document.querySelectorAll('.modal-floating').forEach(m => m.remove());
        requestAnimationFrame(() => {
            document.querySelectorAll('.month-label').forEach(label => label.remove());
            const allCells = document.querySelectorAll('.fc-daygrid-day');
            const addedMonths = new Set();

            allCells.forEach(cell => {
                const dateStr = cell.getAttribute('data-date');
                if (!dateStr) return;

                const dateObj = new Date(dateStr);
                if (dateObj.getDate() === 1) {
                    const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
                    if (!addedMonths.has(monthKey)) {
                        const badge = document.createElement("div");
                        badge.className = "month-label";
                        badge.textContent = dateObj.toLocaleDateString('tr-TR', { month: 'long' }).toUpperCase();
                        cell.prepend(badge);
                        addedMonths.add(monthKey);
                    }
                }
            });
        });
    });

    calendar.render();
    window.bookingCalendar = calendar;

    const calendarWrapper = document.querySelector('#calendarView');
    calendarWrapper.addEventListener('wheel', function (e) {
        if (calendar.view.type !== "dayGridMonth") return;
        e.preventDefault();
        e.deltaY < 0 ? calendar.prev() : calendar.next();
    }, { passive: false });
});