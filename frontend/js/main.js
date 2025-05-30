const API_BASE = 'https://hotel-reservation-app-9jui.onrender.com';

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  if (!calendarEl) return;

  function getCalendarOptions(view = "dayGridMonth") { 
    return {
      locale: "pt-br",
      aspectRatio: 1.35,
      initialView: view,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      slotLabelFormat: {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
      buttonText: {
        today: "Hoje",
        month: "Mês",
        week: "Semana",
        day: "Dia",
        list: "Lista",
      },
      events: async function (fetchInfo, successCallback, failureCallback) {
        try {
          const response = await fetch(`${API_BASE}/reservations`);
          const reservations = await response.json();
          const events = reservations.map((reservation) => ({
            id: reservation.id,
            title: `Quarto: ${reservation.room_number}`,
            start: reservation.start_time,
            end: reservation.end_time,
            extendedProps: {
              customerName: reservation.customer_name,
              customerEmail: reservation.customer_email,
            },
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
          title: "Gerenciar Reserva",
          text: "Deseja editar ou excluir a reserva?",
          icon: "question",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "Editar",
          denyButtonText: "Excluir",
          cancelButtonText: "Cancelar",
        });
  
        if (result.isConfirmed) {
          const updateData = await promptEditReservation(info.event);
  
          if (updateData && isValidReservation(updateData)) {
            await updateReservation(eventId, updateData);
            Swal.fire("Sucesso!", "Reserva atualizada com sucesso", "success");
            calendar.refetchEvents();
          }
        } else if (result.isDenied) {
          const { isConfirmed } = await Swal.fire({
            title: "Tem certeza?",
            text: "Esta ação não pode ser desfeita!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, excluir!",
            cancelButtonText: "Cancelar",
          });
  
          if (isConfirmed) {
            try {
              await deleteReservation(eventId);
              Swal.fire("Excluído!", "Reserva removida com sucesso.", "success");
              calendar.refetchEvents();
            } catch (error) {
              Swal.fire("Erro!", "Não foi possível excluir a reserva.", "error");
              console.error("Erro ao excluir a reserva: ", error);
            }
          }
        }
      },
    };
  }

  let initialView = "dayGridMonth";
  let calendar = new FullCalendar.Calendar(calendarEl, getCalendarOptions(initialView));
  calendar.render();

  document.addEventListener("click", async function (event) {
    if (event.target.id === "create-reservation-btn") {
      const { value: formValues } = await Swal.fire({
        title: "Nova Reserva",
        width: "40rem",
        html: `
              <div class="container">
                  <div class="swal2-form-group">
                      <label for="swal-room">Número do Quarto:</label>
                      <input id="swal-room" class="swal2-input" type="number">
                      <div class="error-message" id="error-room"></div>
                  </div>
  
                  <div class="swal2-form-group">
                      <label for="swal-start">Data de Início:</label>
                      <input id="swal-start" class="swal2-input" type="datetime-local">
                      <div class="error-message" id="error-start"></div>
                  </div>
  
                  <div class="swal2-form-group">
                      <label for="swal-end">Data de Término:</label>
                      <input id="swal-end" class="swal2-input" type="datetime-local">
                      <div class="error-message" id="error-end"></div>
                  </div>
  
                  <div class="swal2-form-group">
                      <label for="swal-name">Nome do Cliente:</label>
                      <input id="swal-name" class="swal2-input">
                      <div class="error-message" id="error-name"></div>
                  </div>
  
                  <div class="swal2-form-group">
                      <label for="swal-email">E-mail do Cliente:</label>
                      <input id="swal-email" class="swal2-input" type="email">
                      <div class="error-message" id="error-email"></div>
                  </div>
              </div>
              `,
        showCancelButton: true,
        confirmButtonText: "Salvar",
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        preConfirm: () => {
          const data = {
            room_number: document.getElementById("swal-room").value,
            start_time: document.getElementById("swal-start").value,
            end_time: document.getElementById("swal-end").value,
            customer_name: document.getElementById("swal-name").value,
            customer_email: document.getElementById("swal-email").value,
          };
  
        if (!isValidReservation(data)) {
          return false;
        }
  
          return data;
        },
      });

      if (formValues) {
        try {
          await createReservation(formValues);
          Swal.fire("Sucesso!", "Reserva criada com sucesso!", "success");
          calendar.refetchEvents();
        } catch (error) {
          Swal.fire("Erro!", "Erro ao criar reserva: " + error.message, "error");
        }
      }
    }

    if (event.target.id === "cancel-reservation-btn") {
      const formEl = document.getElementById("reservation-form");
      if (formEl) formEl.style.display = "none";
    }


    if (event.target.id === "submit-reservation-btn") {
      const formEl = document.getElementById("reservation-form");

      if (!formEl) return;

      const roomNumber = document.getElementById("room-number").value;
      const startTime = document.getElementById("start-time").value;
      const endTime = document.getElementById("end-time").value;
      const customerName = document.getElementById("customer-name").value;
      const customerEmail = document.getElementById("customer-email").value;
  
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
        Swal.fire("Sucesso!", "Reserva criada com sucesso!", "success");
        clearForm();
        formEl.style.display = "none";
        calendar.refetchEvents();
      } catch (error) {
        Swal.fire("Erro!", "Erro ao criar reserva: " + error.message, "error");
      }
    }
  });
});

async function promptEditReservation(event) {
  const { value: formValues } = await Swal.fire({
    title: "Editar Reserva",
    width: "40rem",
    html: `
        <div  class="container">
        <div class="swal2-form-group">
            <label for="swal-room">Número do Quarto:</label>
            <input id="swal-room" class="swal2-input" value="${
              event.title.split(" ")[1] || ""
            }">
            <div class="error-message" id="error-room"></div>
        </div>

        <div class="swal2-form-group">
            <label for="swal-start">Data de Início:</label>
            <input type="datetime-local" id="swal-start" class="swal2-input" value="${
              event.start ? event.start.toISOString().slice(0, 16) : ""
            }">
            <div class="error-message" id="error-start"></div>
        </div>

        <div class="swal2-form-group">
            <label for="swal-end">Data de Término:</label>
            <input type="datetime-local" id="swal-end" class="swal2-input" value="${
              event.end ? event.end.toISOString().slice(0, 16) : ""
            }">
            <div class="error-message" id="error-end"></div>
        </div>

        <div class="swal2-form-group">
            <label for="swal-name">Nome do Cliente:</label>
            <input id="swal-name" class="swal2-input" value="${
              event.extendedProps?.customerName || ""
            }">
            <div class="error-message" id="error-name"></div>
        </div>

        <div class="swal2-form-group">
            <label for="swal-email">E-mail do Cliente:</label>
            <input id="swal-email" class="swal2-input" value="${
              event.extendedProps?.customerEmail || ""
            }">
            <div class="error-message" id="error-email"></div>
        </div>        
        </div>`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Salvar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const data = {
        room_number: document.getElementById("swal-room").value,
        start_time: document.getElementById("swal-start").value,
        end_time: document.getElementById("swal-end").value,
        customer_name: document.getElementById("swal-name").value,
        customer_email: document.getElementById("swal-email").value,
      };

      if (!isValidReservation(data)) {
        return false;
      }

      return data;
    },
  });

  if (!formValues) return null;

  return formValues;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function isValidReservation(data) {
  let isValid = true;

  document.getElementById('error-room').textContent = "";
  document.getElementById('error-start').textContent = "";
  document.getElementById('error-end').textContent = "";
  document.getElementById('error-name').textContent = "";
  document.getElementById('error-email').textContent = "";

  document.getElementById('swal-room').classList.remove("error");
  document.getElementById('swal-start').classList.remove("error");
  document.getElementById('swal-end').classList.remove("error");
  document.getElementById('swal-name').classList.remove("error");
  document.getElementById('swal-email').classList.remove("error");

if (!data.room_number) {
  document.getElementById("error-room").textContent = "Número do quarto é obrigatório.";
  document.getElementById("swal-room").classList.add("error");
  isValid = false;
}

if (!data.start_time) {
  document.getElementById("error-start").textContent = "Data de início é obrigatória.";
  document.getElementById("swal-start").classList.add("error");
  isValid = false;
}

if (!data.end_time) {
  document.getElementById("error-end").textContent = "Data de término é obrigatória.";
  document.getElementById("swal-end").classList.add("error");
  isValid = false;
}

if (!data.customer_name) {
  document.getElementById("error-name").textContent = "Nome do cliente é obrigatório.";
  document.getElementById("swal-name").classList.add("error");
  isValid = false;
}

if (!data.customer_email) {
  document.getElementById("error-email").textContent = "E-mail do cliente é obrigatório.";
  document.getElementById("swal-email").classList.add("error");
  isValid = false;
}

if (data.start_time && data.end_time && new Date(data.start_time) >= new Date(data.end_time)) {
  document.getElementById("error-start").textContent = "A data de início deve ser anterior à data de término.";
  document.getElementById("swal-start").classList.add("error");
  document.getElementById("error-end").textContent = "A data de término deve ser posterior à data de início.";
  document.getElementById("swal-end").classList.add("error");
  isValid = false; 
}

if (data.room_number && !/^\d+$/.test(data.room_number)) {
  document.getElementById("error-room").textContent = "O número do quarto deve conter apenas dígitos.";
  document.getElementById("swal-room").classList.add("error");
  isValid = false;
}

if (data.customer_name && (data.customer_name.length < 3 || data.customer_name.length > 100)) {
  document.getElementById("error-name").textContent = "O nome deve ter entre 3 e 100 caracteres.";
  document.getElementById("swal-name").classList.add("error");
  isValid = false;
}

if (data.customer_email && (data.customer_email.length < 3 || data.customer_email.length > 100)) {
  document.getElementById("error-email").textContent = "O e-mail deve ter entre 3 e 100 caracteres.";
  document.getElementById("swal-email").classList.add("error");
  isValid = false;
}

if (data.customer_email && !isValidEmail(data.customer_email)) {
  document.getElementById("error-email").textContent = "O e-mail fornecido é inválido.";
  document.getElementById("swal-email").classList.add("error");
  isValid = false;
}

if (isValid) {
  try {
    const response = await fetch(`${API_BASE}/reservations`);
    const reservations = await response.json();
    const startTime = new Date(data.start_time);
    const endTime = new Date(data.end_time);

    const sameRoomReservations = reservations.filter((reservation) => {
      return Number(reservation.room_number) === Number(data.room_number);
    });

    const hasConflict = sameRoomReservations.some((reservation) => {
      const resStart = new Date(reservation.start_time);
      const resEnd = new Date(reservation.end_time);

      return (
        startTime < resEnd && endTime > resStart
      );
    });

    if (hasConflict) {
      document.getElementById("error-start").textContent = "Já existe uma reserva nesse horário para este quarto.";
      document.getElementById("swal-start").classList.add("error");
      document.getElementById("error-end").textContent = "Escolha outro horário ou quarto.";
      document.getElementById("swal-end").classList.add("error");
      isValid = false;
    }
  } catch (error) {
    console.error("Erro ao verificar conflitos de reserva:", error);
    isValid = false;
  }
}

return isValid;

}

async function createReservation(data) {
  const response = await fetch(`${API_BASE}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Erro desconhecido ao criar reserva");
  }

  return response.json();
}

async function updateReservation(id, data) {
  await fetch(`${API_BASE}/reservations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function deleteReservation(id) {
  try {
    const response = await fetch(`${API_BASE}/reservations/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Erro ao excluir reserva: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erro ao excluir reserva:", error);
    throw error;
  }
}

function clearForm() {
  document.getElementById("room-number").value = "";
  document.getElementById("start-time").value = "";
  document.getElementById("end-time").value = "";
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-email").value = "";
}
