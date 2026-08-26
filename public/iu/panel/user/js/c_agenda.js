const formulario = document.getElementById("frmAgenda");

const actividad = document.getElementById("actividad");
const lugar = document.getElementById("lugar");
const fecha = document.getElementById("fecha");
const hora = document.getElementById("hora");

const contador = document.getElementById("contadorActual");
const btnCancelar = document.getElementById("btnCancelar");
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";
/* ========================= */
/* FECHA Y HORA ACTUAL */
/* ========================= */

function cargarFechaHoraActual() {

  const ahora = new Date();

  // Fecha
  fecha.value = ahora.toISOString().split("T")[0];

  // Hora
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");

  hora.value = `${horas}:${minutos}`;

}

/* ========================= */
/* CONTADOR DE CARACTERES */
/* ========================= */

actividad.addEventListener("input", () => {

  contador.textContent = actividad.value.length;

});

/* ========================= */
/* ENVIAR FORMULARIO */
/* ========================= */

formulario.addEventListener("submit", async (e) => {

  e.preventDefault();

  if (actividad.value.trim() === "") {

    alert("Ingrese una actividad.");

    actividad.focus();

    return;

  }

  if (lugar.value === "") {

    alert("Seleccione un lugar.");

    lugar.focus();

    return;

  }

  if (fecha.value === "") {

    alert("Seleccione una fecha.");

    fecha.focus();

    return;

  }

  if (hora.value === "") {

    alert("Seleccione una hora.");

    hora.focus();

    return;

  }

  const agenda = {

    actividad: actividad.value.trim(),

    lugar: lugar.value,

    fecha: fecha.value,

    hora: hora.value

  };

  try {

    const response = await fetch(
      `${API_URL}/agenda`,
      {
        method: "POST",

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify(agenda)

      }
    );

    const resultado = await response.json();

    if(response.ok){

      alert("Agenda registrada correctamente.");

      console.log(resultado);

    }else{

      alert("Error al guardar.");

      console.error(resultado);

    }

    formulario.reset();

    contador.textContent = "0";

    cargarFechaHoraActual();

  } catch (error) {

    console.error(error);

    alert("No fue posible registrar la actividad.");

  }

});

/* ========================= */
/* INICIALIZAR */
/* ========================= */

cargarFechaHoraActual();
contador.textContent = "0";

btnCancelar.addEventListener("click", () => {

  if(confirm("¿Desea cancelar el registro del evento?")){

    window.location.href = "panel_creacion.html";

  }

});
