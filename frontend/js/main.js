document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: async function (fetchInfo, successCallback, failureCallback) {
            try {
                const response = await fetch('http://localhost:8000/reservations');
                const reservations = await response.json();
                const events = reservations.map(reservation => ({
                    title: `Room ${reservation.room_number}`,
                    start: reservation.start_time,
                    end: reservation.end_time,
                }));
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },
    });
    calendar.render();
});