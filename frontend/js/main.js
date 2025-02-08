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
                    extendedProps: {
                        customerName: reservation.customer_name,
                        customerEmail: reservation.customer_email,
                    }
                }));
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },

        editable: true,
        eventClick: async function (info) {
            const eventId = info.event.id;

            const result = await Swal.fire({
                title: 'Gerenciar Reserva',
                text: 'Deseja editar ou excluir a reserva?',
                icon: 'question',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Editar',
                denyButtonText: 'Excluir',
                cancelButtonText: 'Cancelar',
            });

            if (result.isConfirmed) {
                const updateData = await promptEditReservation(info.event);

                if (updateData && isValidReservation(updateData)) {

                    await updateReservation(eventId, updateData);
                    Swal.fire('Sucesso!', 'Reserva atualizada com sucesso', 'success');
                    calendar.refetchEvents();
                }
            } else if (result.isDenied) {
                const { isConfirmed } = await Swal.fire({
                    title: 'Tem certeza?',
                    text: 'Esta ação não pode ser desfeita!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sim, excluir!',
                    cancelButtonText: 'Cancelar'
                });

                if (isConfirmed) {

                    try {
                        await deleteReservation(eventId);
                        Swal.fire('Excluído!', 'Reserva removida com sucesso.', 'success');
                        calendar.refetchEvents();
                    } catch (error) {
                        Swal.fire('Erro!', 'Não foi possível excluir a reserva.', 'error');
                        console.error('Erro ao excluir a reserva: ', error);
                    }
                }
            }
        }
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
            Swal.fire('Sucesso!', 'Reserva criada com sucesso!', 'success');
            clearForm();
            formEl.style.display = 'none';
            calendar.refetchEvents();
        } catch (error) {
            Swal.fire('Erro!', 'Erro ao criar reserva: ' + error.message, 'error');
        }
    });

});


async function promptEditReservation(event) {
    const { value: formValues } = await Swal.fire({
        title: 'Editar Reserva',
        width: '40rem',
        html:
            `<style>
            .swal2-form-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
                text-align: left;
                width: 100%;
            }
            .swal2-form-group label {
                font-weight: bold;
            }
            .swal2-form-group input {
                width: 100%;
                margin: 16px 0px 3px !important;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 16px;
            }   
        </style>

        <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="swal2-form-group">
            <label for="swal-room">Número do Quarto:</label>
            <input id="swal-room" class="swal2-input" value="${event.title.split(' ')[1] || ''}" style="width: 95%;">
        </div>

        <div class="swal2-form-group">
            <label for="swal-start">Data de Início:</label>
            <input type="datetime-local" id="swal-start" class="swal2-input" value="${event.start ? event.start.toISOString().slice(0, 16) : ''}" style="width: 95%;">
        </div>

        <div class="swal2-form-group">
            <label for="swal-end">Data de Término:</label>
            <input type="datetime-local" id="swal-end" class="swal2-input" value="${event.end ? event.end.toISOString().slice(0, 16) : ''}" style="width: 95%;">
        </div>

        <div class="swal2-form-group">
            <label for="swal-name">Nome do Cliente:</label>
            <input id="swal-name" class="swal2-input" value="${event.extendedProps?.customerName || ''}" style="width: 95%;">
        </div>

        <div class="swal2-form-group">
            <label for="swal-email">E-mail do Cliente:</label>
            <input id="swal-email" class="swal2-input" value="${event.extendedProps?.customerEmail || ''}" style="width: 95%;">
        </div>        
        </div>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                room_number: document.getElementById('swal-room').value,
                start_time: document.getElementById('swal-start').value,
                end_time: document.getElementById('swal-end').value,
                customer_name: document.getElementById('swal-name').value,
                customer_email: document.getElementById('swal-email').value
            };
        }
    });

    if (!formValues) return null;

    return formValues;
}


function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function isValidReservation(data) {
    if (!data.room_number || !data.start_time || !data.end_time || !data.customer_name || !data.customer_email) {
        Swal.fire('Erro!', 'Todos os campos são obrigatórios.', 'error');
        return false;
    }

    if (new Date(data.start_time) >= new Date(data.end_time)) {
        Swal.fire('Erro!', 'A data de início deve ser anterior à data de término,', 'error');
        return false;
    }

    if (!/^\d+$/.test(data.room_number)) {
        Swal.fire('Erro!', 'O número do quarto deve conter apenas dígitos.', 'error');
        return false;
    }

    if (data.customer_name.length < 3 || data.customer_name.length > 100) {
        Swal.fire('Erro!', 'O nome do cliente deve ter entre 3 e 100 caracteres.', 'error');
        return false;
    }

    if (data.customer_email.length < 3 || data.customer_email.length > 100) {
        Swal.fire('Erro!', 'O e-mail do cliente deve ter entre 3 e 100 caracteres.', 'error');
        return false;
    }

    if (!isValidEmail(data.customer_email)) {
        Swal.fire('Erro!', 'O e-mail fornecido é inválido.', 'error');
        return false;
    }

    return true;
}

async function createReservation(data) {
    await fetch('http://localhost:8000/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

async function updateReservation(id, data) {
    await fetch(`http://localhost:8000/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

async function deleteReservation(id) {

    try {
        const response = await fetch(`http://localhost:8000/reservations/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Erro ao excluir reserva: ${response.statusText}`);
        }

        console.log('Reserva excluída com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir reserva:', error);
        throw error;
    }
}

function clearForm() {
    document.getElementById('room-number').value = '';
    document.getElementById('start-time').value = '';
    document.getElementById('end-time').value = '';
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-email').value = '';
}
