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
                    title: `Quarto: ${reservation.room_number}`,
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

                    if (!isValidReservation(updateData)) {
                        return;
                    }
                    await updateReservation(eventId, updateData);
                    alert('Reserva atualizada com sucesso!');
                    calendar.refetchEvents();
                }
            } else {
                if (confirm('Deseja realmente excluir esta reserva?')) {
                    await deleteReservation(eventId);
                    alert('Reserva excluída com sucesso!');
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

        if (!isValidReservation(data)) {
            return;
        }

        try {
            await createReservation(data);
            alert('Reserva criada com sucesso!');
            clearForm();
            formEl.style.display = 'none';
            calendar.refetchEvents();
        } catch (error) {
            alert('Erro ao criar reserva: ' + error.message);
        }
    });

});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function isValidReservation(data) {
    if (!data.room_number || !data.start_time || !data.end_time || !data.customer_name || !data.customer_email) {
        alert('Todos os campos são obrigatórios.');
        return false;
    }

    if (new Date(data.start_time) >= new Date(data.end_time)) {
        alert('A data de início deve ser anterior à data de término,');
        return false;
    }

    if (!/^\d+$/.test(data.room_number)) {
        alert('O número do quarto deve conter apenas dígitos.');
        return false;
    }

    if (data.customer_name.length < 3 || data.customer_name.length > 100) {
        alert('O nome do cliente deve ter entre 3 e 100 caracteres.');
        return false;
    }

    if (data.customer_email.length < 3 || data.customer_email.length > 100) {
        alert('O e-mail do cliente deve ter entre 3 e 100 caracteres.');
        return false;
    }

    if (!isValidEmail(data.customer_email)) {
        alert('O e-mail fornecido é inválido.');
        return false;
    }

    return true;

}

async function createReservation(data) {

    try {
        const response = await fetch('http://localhost:8000/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            if (response.status === 409) {
                const error = await response.json();
                alert(error.error);
            } else {
                throw new Error('Erro ao criar reserva. Tente novamente.');
            }
        }
        return response.json();

    } catch (error) {
        console.error('Erro ao criar reserva: ', error);
        throw error;
    }
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
    const roomNumber = prompt('Número do quarto:', event.title.split(' ')[1] || '');
    const startTime = prompt('Data de início (YYYY-MM-DDTHH:mm:ss):', event.start ? event.start.toISOString().slice(0, 16) : '');
    const endTime = prompt('Data de término (YYYY-MM-DDTHH:mm:ss):', event.end ? event.end.toISOString().slice(0, 16) : '');
    const customerName = prompt('Nome do cliente:', event.extendedProps?.customerName || '');
    const customerEmail = prompt('E-mail do cliente:', event.extendedProps?.customerEmail || '');

    const data = {
        room_number: roomNumber,
        start_time: startTime,
        end_time: endTime,
        customer_name: customerName,
        customer_email: customerEmail,
    };

    if (!isValidReservation(data)) {
        alert('Alguns dados são inválidos. A atualização foi cancelada.');
        return null;
    }

    return data;

}

function clearForm() {
    document.getElementById('room-number').value = '';
    document.getElementById('start-time').value = '';
    document.getElementById('end-time').value = '';
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-email').value = '';
}
