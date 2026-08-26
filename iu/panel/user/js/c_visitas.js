const formulario = document.getElementById("frmVisita");

const nombreVisitante =
  document.getElementById("nombreVisitante");

const dniVisitante =
  document.getElementById("dniVisitante");

const funcionarioVisitado =
  document.getElementById("funcionarioVisitado");

const horaEntrada =
  document.getElementById("horaEntrada");

const horaSalida =
  document.getElementById("horaSalida");

const motivo =
  document.getElementById("motivo");

const lugarVisita =
  document.getElementById("lugarVisita");

const fechaRegistro =
  document.getElementById("fechaRegistro");

const btnCancelar =
  document.getElementById("btnCancelar");

const contadorNombre =
  document.getElementById("contadorNombre");

const contadorFuncionario =
  document.getElementById("contadorFuncionario");

const contadorMotivo =
  document.getElementById("contadorMotivo");

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";
/* ==========================================
   CONTADORES DE CARACTERES
========================================== */

nombreVisitante.addEventListener("input", () => {

  contadorNombre.textContent =
    `${nombreVisitante.value.length} / 20 caracteres`;

});


funcionarioVisitado.addEventListener("input", () => {

  contadorFuncionario.textContent =
    `${funcionarioVisitado.value.length} / 20 caracteres`;

});


motivo.addEventListener("input", () => {

  contadorMotivo.textContent =
    `${motivo.value.length} / 50 caracteres`;

});


/* ==========================================
   FECHA DE REGISTRO
========================================== */

function obtenerFechaActual(){

  const ahora = new Date();

  const anio =
    ahora.getFullYear();

  const mes =
    String(ahora.getMonth() + 1)
      .padStart(2, "0");

  const dia =
    String(ahora.getDate())
      .padStart(2, "0");

  return `${anio}-${mes}-${dia}`;

}


/* ==========================================
   HORA ACTUAL
========================================== */

function obtenerHoraActual(){

  const ahora = new Date();

  const horas =
    String(ahora.getHours())
      .padStart(2, "0");

  const minutos =
    String(ahora.getMinutes())
      .padStart(2, "0");

  return `${horas}:${minutos}`;

}


/* ==========================================
   INICIALIZAR
========================================== */

fechaRegistro.value =
  obtenerFechaActual();


/* ==========================================
   CANCELAR
========================================== */

btnCancelar.addEventListener("click", () => {

  window.location.href =
    "panel_creacion.html";

});


/* ==========================================
   VALIDAR DNI
========================================== */

dniVisitante.addEventListener("input", () => {

  dniVisitante.value =
    dniVisitante.value
      .replace(/\D/g, "")
      .slice(0, 8);

});


/* ==========================================
   ENVIAR FORMULARIO
========================================== */

formulario.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();


    /* ==============================
       VALIDACIONES
    =============================== */

    if(
      nombreVisitante.value.trim() === ""
    ){

      alert(
        "Ingrese el nombre del visitante."
      );

      nombreVisitante.focus();

      return;

    }


    if(
      dniVisitante.value.length !== 8
    ){

      alert(
        "El DNI debe tener 8 dígitos."
      );

      dniVisitante.focus();

      return;

    }


    if(
      funcionarioVisitado.value.trim() === ""
    ){

      alert(
        "Ingrese el funcionario visitado."
      );

      funcionarioVisitado.focus();

      return;

    }


    if(
      horaEntrada.value === ""
    ){

      alert(
        "Seleccione la hora de entrada."
      );

      horaEntrada.focus();

      return;

    }


    if(
      horaSalida.value === ""
    ){

      alert(
        "Seleccione la hora de salida."
      );

      horaSalida.focus();

      return;

    }


    /* ==============================
       VALIDAR HORARIOS
    =============================== */

    if(
      horaSalida.value <=
      horaEntrada.value
    ){

      alert(
        "La hora de salida debe ser posterior a la hora de entrada."
      );

      horaSalida.focus();

      return;

    }


    if(
      motivo.value.trim() === ""
    ){

      alert(
        "Ingrese el motivo de la visita."
      );

      motivo.focus();

      return;

    }


    if(
      lugarVisita.value.trim() === ""
    ){

      alert(
        "Ingrese el lugar específico de la visita."
      );

      lugarVisita.focus();

      return;

    }


    /* ==============================
       CREAR OBJETO
    =============================== */

    const visita = {

      fechaRegistro:
      fechaRegistro.value,

      nombreVisitante:
        nombreVisitante.value.trim(),

      dniVisitante:
      dniVisitante.value,

      funcionarioVisitado:
        funcionarioVisitado.value.trim(),

      horaEntradaRegistrada:
      horaEntrada.value,

      horaSalidaRegistrada:
      horaSalida.value,

      motivo:
        motivo.value.trim(),

      lugarEspecificoVisita:
        lugarVisita.value.trim()

    };


    console.log(
      "Datos enviados:",
      visita
    );


    /* ==============================
       GUARDAR EN BACKEND
    =============================== */

    try{

      const response =
        await fetch(
          `${API_URL}/visitas`,
          {

            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(visita)

          }
        );


      /* ==============================
         RESPUESTA
      =============================== */

      const resultado =
        await response.json();


      if(response.ok){

        alert(
          "Visita registrada correctamente."
        );

        console.log(
          "Respuesta:",
          resultado
        );


        /* Limpiar formulario */

        formulario.reset();


        /* Volver a establecer fecha */

        fechaRegistro.value =
          obtenerFechaActual();


        /* Establecer hora actual */

        horaEntrada.value =
          obtenerHoraActual();


        horaSalida.value = "";


      }else{

        console.error(
          "Error del servidor:",
          resultado
        );

        alert(
          "No fue posible registrar la visita."
        );

      }


    }catch(error){

      console.error(
        "Error de conexión:",
        error
      );

      alert(
        "No fue posible conectar con el servidor."
      );

    }

  }
);
