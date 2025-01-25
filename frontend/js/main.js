document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: async function (fetchInfo, successCallback, failureCallback) {
            try {
                const response = await fetch('http://localhost:8000/reservations');
                const reservations = await response.json();
                const events = reservations.map(reservation => ({
                    id: reservation.id,
                    title: `Room ${reservation.room_number}`,
                    start: reservation.start_time,
                    end: reservation.end_time,
                }));
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },

        editable: true,
        eventClick: async function (info) {
            const eventId = info.event.id;

            const action = confirm('Clique OK para editar ou Cancelar para excluir.');

            if (action) {
                const updateData = promptEditReservation(info.event);

                if (updateData) {
                    await updateReservation(eventId, updateData);
                    calendar.refetchEvents();
                }
            } else {
                if (confirm('Deseja realmente excluir esta reserva?')) {
                    await deleteReservation(eventId);
                    calendar.refetchEvents();
                }
            }
        },

    });
    calendar.render();


    const createBtn = document.getElementById('create-reservation-btn');
    const formEl = document.getElementById('reservation-form');
    const submitBtn = document.getElementById('submit-reservation-btn');
    const cancelBtn = document.getElementById('cancel-reservation-btn');

    createBtn.addEventListener('click', () => {
        formEl.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        formEl.style.display = 'none';
    });

    submitBtn.addEventListener('click', async () => {
        const roomNumber = document.getElementById('room-number').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const customerName = document.getElementById('customer-name').value;
        const customerEmail = document.getElementById('customer-email').value;

        const data = {
            room_number: roomNumber,
            start_time: startTime,
            end_time: endTime,
            customer_name: customerName,
            customer_email: customerEmail,
        };


        try {
            await createReservation(data);
            formEl.style.display = 'none';
            calendar.refetchEvents();
        } catch (error) {
            console.error('Erro ao criar reserva: ', error);
        }
    });

});

async function createReservation(data) {
    const response = await fetch('http://localhost:8000/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
}

async function updateReservation(id, data) {
    const response = await fetch(`http://localhost:8000/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
}

async function deleteReservation(id) {
    const response = await fetch(`http://localhost:8000/reservations/${id}`, {
        method: 'DELETE',
    });
    return response.json();
}


function promptEditReservation(event) {
    const roomNumber = prompt('Número do quarto:', event.title.split(' ')[1]);
    const startTime = prompt('Data de início (YYYY-MM-DDTHH:mm:ss):', event.start.toISOString().slice(0, 16));
    const endTime = prompt('Data de término (YYYY-MM-DDTHH:mm:ss):', event.end.toISOString().slice(0, 16));
    const customerName = prompt('Nome do cliente:', 'Atualize o nome aqui');
    const customerEmail = prompt('E-mail do cliente:', 'Atualize o e-mail aqui');

    if (!roomNumber || !startTime || !endTime || !customerName || !customerEmail){
        alert('Todos os campos devem ser preenchidos.');
        return null;
    }

    return {
        room_number: roomNumber,
        start_time: startTime,
        end_time: endTime,
        customer_name: customerName,
        customer_email: customerEmail,
    };
}

























































// document.addEventListener('DOMContentLoaded', function () {
//     const calendarEl = document.getElementById('calendar');
//     const calendar = new FullCalendar.Calendar(calendarEl, {
//         initialView: 'dayGridMonth',
//         events: async function (fetchInfo, successCallback, failureCallback) {
//             try {
//                 const response = await fetch('http://localhost:8000/reservations');
//                 const reservations = await response.json();
//                 const events = reservations.map(reservation => ({
//                     title: `Room ${reservation.room_number}`,
//                     start: reservation.start_time,
//                     end: reservation.end_time,
//                 }));
//                 successCallback(events);
//             } catch (error) {
//                 failureCallback(error);
//             }
//         },
//     });
//     calendar.render();
// });

// async function createReservation(data) {
//     const response = await fetch('http://localhost:8000/reservations', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json'},
//         body: JSON.stringify(data),
//     });
//     return response.json();
// }

// async function updateReservation(id, data) {
//     const response = await fetch(`http://localhost:8000/reservations/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//     });
//     return response.json();
// }

// async function deleteReservation(id) {
//     const response = await fetch(`http://localhost:8000/reservations/${id}`, {
//         method: 'DELETE',
//     });
//     return response.json();
// }