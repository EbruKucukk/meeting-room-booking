document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('calendarView');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'tr',
        height: '100%',
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

        // 🟡 Event detay modalı
        eventClick: function (info) {
            showEventModal(info);
        },

        // 🟢 Yeni toplantı kutusu açılır
        dateClick: function (info) {
            openCreateModal(info, info.jsEvent); // 🔥 DÜZELTME BURADA
        }
    });

    calendar.render();
    window.bookingCalendar = calendar; // dış erişim için global değişken
});
