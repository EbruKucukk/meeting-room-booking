document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendarView');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'tr', // Türkçe dil desteği aktif
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

        // API'den toplantı verilerini al
        events: async function (fetchInfo, successCallback, failureCallback) {
            try {
                const response = await fetch('/api/meetings');
                const data = await response.json();

                const events = data.map(m => ({
                    id: m.id,
                    title: `${m.title} - ${m.roomName}`,
                    start: m.startTime,
                    end: m.endTime,
                    extendedProps: {
                        organizer: m.organizer
                    }
                }));

                successCallback(events);
            } catch (error) {
                console.error('Takvim verisi alınamadı:', error);
                failureCallback(error);
            }
        },

        // Etkinliğe tıklanınca detay göster
        eventClick: function (info) {
            const event = info.event;
            alert(
                `📌 Toplantı: ${event.title}\n` +
                `👤 Organizatör: ${event.extendedProps.organizer}\n` +
                `🕒 Başlangıç: ${event.start.toLocaleString()}\n` +
                `🕓 Bitiş: ${event.end.toLocaleString()}`
            );
        }
    });

    calendar.render();
});
