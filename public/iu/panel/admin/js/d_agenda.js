/* =========================================================
   D_AGENDA.JS
   GESTIÓN COMPLETA DE AGENDA
========================================================= */
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

/* =========================================================
   CONTROL DE SESIÓN
========================================================= */

const LOGIN_URL = "../error.html";

/*
 * El backend maneja el lapso de 10 minutos.
 *
 * El frontend registra actividad cada minuto
 * para mantener la sesión activa mientras
 * el usuario permanece trabajando.
 */
const INTERVALO_SESION = 60 * 1000;

let intervaloSesion = null;

let redirigiendo = false;

let agendaGlobal = [];
let agendaSeleccionada = null;

/* =========================================================
   SESIÓN Y PERFIL
========================================================= */

const agendaPerfil =
  document.getElementById("agendaPerfil");

const btnAgendaPerfil =
  document.getElementById("btnAgendaPerfil");

const agendaFotoPerfil =
  document.getElementById("agendaFotoPerfil");

const agendaPerfilMenu =
  document.getElementById("agendaPerfilMenu");

const btnAgendaCerrarSesion =
  document.getElementById("btnAgendaCerrarSesion");

// =========================================================
// ELEMENTOS - PERFIL
// =========================================================

const usuarioMenu =
  document.getElementById("usuarioMenu");

const btnPerfil =
  document.getElementById("btnPerfil");

const menuPerfil =
  document.getElementById("menuPerfil");

const fotoPerfil =
  document.getElementById("fotoPerfil");

const nombrePerfil =
  document.getElementById("nombrePerfil");

const rolPerfil =
  document.getElementById("rolPerfil");

const flechaPerfil =
  document.getElementById("flechaPerfil");

const btnCerrarSesion =
  document.getElementById("btnCerrarSesion");
/* =========================================================
   LUGARES DISPONIBLES
========================================================= */

const LUGARES_AGENDA = [
  "Auditorio Municipal",
  "Auditorio de Defensa Civil",
  "Centro Poblado Roma",
  "Centro de Salud Ascope",
  "Distrito de Chicama",
  "Plaza Mayor de Ascope",
  "Plaza de Armas de Ascope",
  "Salón Consistorial",
  "Sector La Arenita"
];


/* =========================================================
   ELEMENTOS - TABLA Y FILTROS
========================================================= */

const tablaAgenda =
  document.getElementById("tablaAgenda");

const buscadorAgenda =
  document.getElementById("buscarActividad");

const filtroLugar =
  document.getElementById("filtroLugar");

const filtroFecha =
  document.getElementById("filtroFecha");


/* =========================================================
   ELEMENTOS - CREAR
========================================================= */

const btnCrearAgenda =
  document.getElementById("btnCrearAgenda");

const modalCrearAgenda =
  document.getElementById("modalCrearAgenda");

const cerrarCrearAgenda =
  document.getElementById("cerrarCrearAgenda");

const cancelarCrearAgenda =
  document.getElementById("cancelarCrearAgenda");

const formCrearAgenda =
  document.getElementById("formCrearAgenda");

const crearActividad =
  document.getElementById("crearActividad");

const crearLugar =
  document.getElementById("crearLugar");

const crearFecha =
  document.getElementById("crearFecha");

const crearHora =
  document.getElementById("crearHora");


/* =========================================================
   ELEMENTOS - EDITAR
========================================================= */

const modalEditarAgenda =
  document.getElementById("modalEditarAgenda");

const cerrarEditarAgenda =
  document.getElementById("cerrarEditarAgenda");

const cancelarEditarAgenda =
  document.getElementById("cancelarEditarAgenda");

const formEditarAgenda =
  document.getElementById("formEditarAgenda");

const editarAgendaId =
  document.getElementById("editarAgendaId");

const editarActividad =
  document.getElementById("editarActividad");

const editarLugar =
  document.getElementById("editarLugar");

const editarFecha =
  document.getElementById("editarFecha");

const editarHora =
  document.getElementById("editarHora");


/* =========================================================
   ELEMENTOS - ELIMINAR
========================================================= */

const modalEliminarAgenda =
  document.getElementById("modalEliminarAgenda");

const cancelarEliminarAgenda =
  document.getElementById("cancelarEliminarAgenda");

const confirmarEliminarAgenda =
  document.getElementById("confirmarEliminarAgenda");

const nombreActividadEliminar =
  document.getElementById("nombreActividadEliminar");


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal(modal) {

  if (!modal) return;

  modal.classList.add("mostrar");

}


/* =========================================================
   CERRAR MODAL
========================================================= */

function cerrarModal(modal) {

  if (!modal) return;

  modal.classList.remove("mostrar");

}


/* =========================================================
   CREAR AGENDA
========================================================= */

if (btnCrearAgenda) {

  btnCrearAgenda.addEventListener("click", () => {

    formCrearAgenda?.reset();

    abrirModal(modalCrearAgenda);

    setTimeout(() => {

      crearActividad?.focus();

    }, 100);

  });

}


/* =========================================================
   CERRAR CREAR
========================================================= */

cerrarCrearAgenda?.addEventListener(
  "click",
  () => cerrarModal(modalCrearAgenda)
);


cancelarCrearAgenda?.addEventListener(
  "click",
  () => cerrarModal(modalCrearAgenda)
);


/* =========================================================
   CREAR - SUBMIT
========================================================= */

formCrearAgenda?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const actividad =
      crearActividad.value.trim();

    const lugar =
      crearLugar.value.trim();

    const fecha =
      crearFecha.value;

    const hora =
      crearHora.value;


    if (
      !actividad ||
      !lugar ||
      !fecha ||
      !hora
    ) {

      alert(
        "Complete todos los campos."
      );

      return;

    }


    const agenda = {

      actividad: actividad,

      lugar: lugar,

      fecha: fecha,

      hora: hora

    };


    try {

      const response =
        await fetchAutenticado(
          `${API_URL}/agenda`,
          {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            body:
              JSON.stringify(agenda)
          }
        );


      if (!response.ok) {

        const mensaje =
          await response.text();

        throw new Error(
          mensaje ||
          `Error HTTP ${response.status}`
        );

      }


      const resultado =
        await response.json();


      console.log(
        "Agenda creada:",
        resultado
      );


      cerrarModal(
        modalCrearAgenda
      );


      formCrearAgenda.reset();


      await cargarAgenda();


      alert(
        "La actividad fue registrada correctamente."
      );


    } catch (error) {

      console.error(
        "Error creando agenda:",
        error
      );


      alert(
        "No se pudo registrar la actividad.\n\n" +
        error.message
      );

    }

  }
);

/* =========================================================
   REDIRIGIR AL LOGIN
========================================================= */

function redirigirLogin() {

  if (redirigiendo) {
    return;
  }

  redirigiendo = true;


  /*
   * Detener inmediatamente el control periódico.
   */
  detenerControlSesion();


  /*
   * Evitar que el usuario siga interactuando
   * mientras se realiza la redirección.
   */
  document.body.style.pointerEvents = "none";


  /*
   * Regresar al login.
   */
  window.location.replace(
    LOGIN_URL
  );

}

// =========================================================
// MOSTRAR DATOS DEL PERFIL
// =========================================================

function mostrarPerfil(usuario) {

  if (!usuario) {
    return;
  }


  const nombreCompleto =
    `${usuario.nombres || ""} ${usuario.apellidos || ""}`
      .trim();


  // =======================================================
  // NOMBRE
  // =======================================================

  if (nombrePerfil) {

    nombrePerfil.textContent =
      nombreCompleto ||
      usuario.usuario ||
      "Usuario";

  }


  // =======================================================
  // ROL
  // =======================================================

  if (rolPerfil) {

    if (usuario.rol === "ADMIN") {

      rolPerfil.textContent =
        "Administrador";

    } else {

      rolPerfil.textContent =
        "Personal administrativo";

    }

  }


  // =======================================================
  // FOTO
  // =======================================================

  if (agendaFotoPerfil) {

    agendaFotoPerfil.src =
      usuario.fotoPerfil;

  }

}



/* =========================================================
   VERIFICAR SESIÓN
========================================================= */

async function verificarSesion() {

  try {

    const response =
      await fetch(
        `${API_URL}/usuarios/auth/verificar`,
        {
          method: "GET",
          credentials: "include"
        }
      );


    // =============================================
    // SESIÓN INVÁLIDA
    // =============================================

    if (response.status === 401) {

      redirigirLogin();

      return false;

    }


    // =============================================
    // OTRO ERROR
    // =============================================

    if (!response.ok) {

      console.error(
        "Error verificando sesión:",
        response.status
      );

      return false;

    }


    const usuario =
      await response.json();


// =============================================
// VALIDAR USUARIO ACTIVO
// =============================================

    if (!usuario || usuario.activo !== true) {

      redirigirLogin();

      return false;

    }


// =============================================
// MOSTRAR PERFIL
// =============================================

    mostrarPerfil(usuario);


    return true;


// =============================================
// MOSTRAR PERFIL
// =============================================

    mostrarPerfil(usuario);


// =============================================
// VALIDAR USUARIO ACTIVO
// =============================================

    if (!usuario || usuario.activo !== true) {

      redirigirLogin();

      return false;

    }


    return true;





  } catch (error) {

    console.error(
      "Error verificando sesión:",
      error
    );


    // Si no podemos comprobar la sesión,
    // no dejamos el dashboard abierto.

    redirigirLogin();

    return false;

  }

}


/* =========================================================
   MANTENER SESIÓN ACTIVA
========================================================= */

async function mantenerSesion() {

  if (redirigiendo) {
    return;
  }


  try {

    const response =
      await fetch(
        "http://localhost:8080/usuarios/actividad",
        {
          method: "POST",

          credentials: "include",

          cache: "no-store"
        }
      );


    /*
     * El backend informa que la sesión
     * ya no es válida.
     */
    if (response.status === 401) {

      redirigirLogin();

      return;

    }


    if (!response.ok) {

      console.warn(
        "No se pudo actualizar la actividad:",
        response.status
      );

    }


  } catch (error) {

    /*
     * No redirigimos inmediatamente por
     * un fallo temporal de red.
     */
    console.error(
      "Error manteniendo sesión:",
      error
    );

  }

}


/* =========================================================
   INICIAR CONTROL DE SESIÓN
========================================================= */

function iniciarControlSesion() {

  detenerControlSesion();


  intervaloSesion =
    setInterval(
      async () => {

        if (redirigiendo) {
          return;
        }


        await mantenerSesion();

      },
      INTERVALO_SESION
    );

}


/* =========================================================
   DETENER CONTROL DE SESIÓN
========================================================= */

function detenerControlSesion() {

  if (
    intervaloSesion !== null
  ) {

    clearInterval(
      intervaloSesion
    );

    intervaloSesion = null;

  }

}


/* =========================================================
   FETCH AUTENTICADO
========================================================= */

async function fetchAutenticado(
  url,
  opciones = {}
) {

  const response =
    await fetch(
      url,
      {
        ...opciones,

        credentials:
          "include"
      }
    );


  /*
   * Cualquier 401 significa:
   *
   * - sesión expirada
   * - sesión inválida
   * - usuario inactivo
   */
  if (
    response.status === 401
  ) {

    redirigirLogin();


    throw new Error(
      "Sesión inválida o expirada."
    );

  }


  return response;

}

/* =========================================================
   CARGAR AGENDA
========================================================= */

async function cargarAgenda() {

  if (!tablaAgenda) {

    console.error(
      "No existe #tablaAgenda."
    );

    return;

  }


  try {

    tablaAgenda.innerHTML = `
      <tr>
        <td colspan="6" class="agenda-sin-registros">
          <i class="bi bi-arrow-repeat"></i>
          Cargando agenda...
        </td>
      </tr>
    `;


    const response =
      await fetchAutenticado(
        `${API_URL}/agenda`,
        {
          method: "GET",

          credentials: "include",

          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    console.log(
      "GET /agenda:",
      response.status
    );


    if (!response.ok) {

      throw new Error(
        `Error HTTP ${response.status}`
      );

    }


    const datos =
      await response.json();


    console.log(
      "Agenda recibida:",
      datos
    );


    if (!Array.isArray(datos)) {

      throw new Error(
        "El servidor no devolvió una lista."
      );

    }


    agendaGlobal = datos;


    prepararFiltroLugares();

    renderizarAgenda();


  } catch (error) {

    console.error(
      "Error cargando agenda:",
      error
    );


    tablaAgenda.innerHTML = `
      <tr>
        <td colspan="6" class="agenda-error">
          <i class="bi bi-exclamation-circle"></i>
          <br>
          No se pudieron cargar los registros de agenda.
          <br>
          <small>
            ${escapeHTML(error.message)}
          </small>
        </td>
      </tr>
    `;

  }

}


/* =========================================================
   FILTRO DE LUGARES
========================================================= */

function prepararFiltroLugares() {

  if (!filtroLugar) return;


  const valorActual =
    filtroLugar.value;


  /*
     Comenzamos siempre con los 9
     lugares oficiales.
  */

  const lugares = [
    ...LUGARES_AGENDA
  ];


  /*
     Si la base de datos contiene
     algún lugar adicional, también
     lo agregamos para no perderlo.
  */

  agendaGlobal.forEach(item => {

    const lugar =
      String(
        item.lugar ?? ""
      ).trim();


    if (
      lugar &&
      !lugares.includes(lugar)
    ) {

      lugares.push(lugar);

    }

  });


  filtroLugar.innerHTML = `
    <option value="">
      Todos los lugares
    </option>
  `;


  lugares
    .sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          "es"
        )
    )
    .forEach(lugar => {

      const option =
        document.createElement(
          "option"
        );

      option.value = lugar;

      option.textContent = lugar;

      filtroLugar.appendChild(
        option
      );

    });


  /*
     Conservamos el filtro anterior
     si todavía existe.
  */

  if (
    lugares.includes(valorActual)
  ) {

    filtroLugar.value =
      valorActual;

  }

}


/* =========================================================
   RENDERIZAR TABLA
========================================================= */

function renderizarAgenda() {

  if (!tablaAgenda) return;


  const texto =
    buscadorAgenda
      ? buscadorAgenda.value
        .toLowerCase()
        .trim()
      : "";


  const lugarSeleccionado =
    filtroLugar
      ? filtroLugar.value
      : "";


  const fechaSeleccionada =
    filtroFecha
      ? filtroFecha.value
      : "";


  const registros =
    agendaGlobal.filter(item => {


      const actividad =
        String(
          item.actividad || ""
        ).toLowerCase();


      const lugar =
        String(
          item.lugar || ""
        ).toLowerCase();


      const coincideBusqueda =
        !texto ||
        actividad.includes(texto) ||
        lugar.includes(texto);


      const coincideLugar =
        !lugarSeleccionado ||
        String(item.lugar || "") ===
        String(lugarSeleccionado);


      const coincideFecha =
        !fechaSeleccionada ||
        String(item.fecha || "") ===
        fechaSeleccionada;


      return (
        coincideBusqueda &&
        coincideLugar &&
        coincideFecha
      );

    });


  if (registros.length === 0) {

    tablaAgenda.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="agenda-sin-registros"
        >
          <i class="bi bi-calendar-x"></i>

          <div>
            No hay registros de agenda.
          </div>
        </td>
      </tr>
    `;

    return;

  }


  tablaAgenda.innerHTML =
    registros.map(
      (item, index) => {


        const actividad =
          item.actividad || "-";


        const lugar =
          item.lugar || "-";


        const fecha =
          formatearFecha(
            item.fecha
          );


        const hora =
          formatearHora(
            item.hora
          );


        /*
           ID real de MongoDB.
        */

        const id =
          item.id ??
          item.agendaId ??
          item.idAgenda;


        /*
           Si no existe ID real,
           no mostramos botones con
           un ID inválido.
        */

        const idSeguro =
          id !== null &&
          id !== undefined
            ? escapeHTML(id)
            : "";


        return `
          <tr>

            <td>
              ${index + 1}
            </td>


            <td>

              <div
                class="agenda-actividad"
              >

                <div
                  class="agenda-actividad-icono"
                >
                  <i
                    class="bi bi-calendar-event"
                  ></i>
                </div>

                <span>
                  ${escapeHTML(
          actividad
        )}
                </span>

              </div>

            </td>


            <td>

              <span
                class="agenda-lugar"
              >

                <i
                  class="bi bi-geo-alt-fill"
                ></i>

                ${escapeHTML(
          lugar
        )}

              </span>

            </td>


            <td>

              <span
                class="agenda-fecha-tabla"
              >
                ${fecha}
              </span>

            </td>


            <td>

              <span
                class="agenda-hora"
              >

                <i
                  class="bi bi-clock"
                ></i>

                ${hora}

              </span>

            </td>


            <td>

              <div
                class="agenda-acciones"
              >

                <button
                  type="button"
                  class="agenda-btn-accion agenda-btn-editar"
                  title="Modificar"
                  data-accion="editar"
                  data-id="${idSeguro}"
                >

                  <i
                    class="bi bi-pencil-fill"
                  ></i>

                </button>


                <button
                  type="button"
                  class="agenda-btn-accion agenda-btn-eliminar-tabla"
                  title="Eliminar"
                  data-accion="eliminar"
                  data-id="${idSeguro}"
                >

                  <i
                    class="bi bi-trash-fill"
                  ></i>

                </button>

              </div>

            </td>

          </tr>
        `;

      }
    ).join("");

}


/* =========================================================
   ACCIONES DE LA TABLA
   EVENT DELEGATION
========================================================= */

tablaAgenda?.addEventListener(
  "click",
  event => {

    const boton =
      event.target.closest(
        "button[data-accion]"
      );


    if (!boton) return;


    const id =
      boton.dataset.id;


    const accion =
      boton.dataset.accion;


    const agenda =
      buscarAgendaPorId(id);


    if (!agenda) {

      console.error(
        "No se encontró la agenda:",
        id
      );

      return;

    }


    if (
      accion === "editar"
    ) {

      abrirEditarAgenda(
        agenda
      );

    }


    if (
      accion === "eliminar"
    ) {

      abrirEliminarAgenda(
        agenda
      );

    }

  }
);


/* =========================================================
   BUSCAR AGENDA POR ID
========================================================= */

function buscarAgendaPorId(id) {

  return agendaGlobal.find(
    item =>
      String(
        item.id ??
        item.agendaId ??
        item.idAgenda
      ) === String(id)
  );

}


/* =========================================================
   ABRIR EDITAR
========================================================= */

function abrirEditarAgenda(agenda) {

  agendaSeleccionada =
    agenda;


  const id =
    agenda.id ??
    agenda.agendaId ??
    agenda.idAgenda;


  editarAgendaId.value =
    id ?? "";


  editarActividad.value =
    agenda.actividad ?? "";


  editarLugar.value =
    agenda.lugar ?? "";


  editarFecha.value =
    normalizarFechaInput(
      agenda.fecha
    );


  editarHora.value =
    normalizarHoraInput(
      agenda.hora
    );


  abrirModal(
    modalEditarAgenda
  );

}


/* =========================================================
   CERRAR EDITAR
========================================================= */

cerrarEditarAgenda?.addEventListener(
  "click",
  () =>
    cerrarModal(
      modalEditarAgenda
    )
);


cancelarEditarAgenda?.addEventListener(
  "click",
  () =>
    cerrarModal(
      modalEditarAgenda
    )
);


/* =========================================================
   GUARDAR MODIFICACIÓN
========================================================= */

formEditarAgenda?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const id =
      editarAgendaId.value;


    if (!id) {

      alert(
        "No se encontró el ID de la actividad."
      );

      return;

    }


    /*
       El backend obtiene el ID desde
       /agenda/{id}, por lo tanto
       no es necesario enviarlo en el body.
    */

    const agendaActualizada = {

      actividad:
        editarActividad.value.trim(),

      lugar:
        editarLugar.value.trim(),

      fecha:
      editarFecha.value,

      hora:
      editarHora.value

    };


    if (
      !agendaActualizada.actividad ||
      !agendaActualizada.lugar ||
      !agendaActualizada.fecha ||
      !agendaActualizada.hora
    ) {

      alert(
        "Complete todos los campos."
      );

      return;

    }


    try {

      const response =
        await fetchAutenticado(
          `${API_URL}/agenda/${encodeURIComponent(id)}`,
          {
            method: "PUT",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            body:
              JSON.stringify(
                agendaActualizada
              )
          }
        );


      if (!response.ok) {

        const mensaje =
          await response.text();

        throw new Error(
          mensaje ||
          `Error HTTP ${response.status}`
        );

      }


      cerrarModal(
        modalEditarAgenda
      );


      agendaSeleccionada =
        null;


      await cargarAgenda();


      alert(
        "La actividad fue modificada correctamente."
      );


    } catch (error) {

      console.error(
        "Error modificando agenda:",
        error
      );


      alert(
        "No se pudo modificar la actividad.\n\n" +
        error.message
      );

    }

  }
);


/* =========================================================
   ABRIR ELIMINAR
========================================================= */

function abrirEliminarAgenda(agenda) {

  agendaSeleccionada =
    agenda;


  nombreActividadEliminar.textContent =
    agenda.actividad ||
    "esta actividad";


  abrirModal(
    modalEliminarAgenda
  );

}


/* =========================================================
   CANCELAR ELIMINAR
========================================================= */

cancelarEliminarAgenda?.addEventListener(
  "click",
  () => {

    agendaSeleccionada =
      null;

    cerrarModal(
      modalEliminarAgenda
    );

  }
);


/* =========================================================
   CONFIRMAR ELIMINAR
========================================================= */

confirmarEliminarAgenda?.addEventListener(
  "click",
  async () => {


    if (!agendaSeleccionada) {

      alert(
        "No se encontró la actividad."
      );

      return;

    }


    const id =
      agendaSeleccionada.id ??
      agendaSeleccionada.agendaId ??
      agendaSeleccionada.idAgenda;


    if (!id) {

      alert(
        "La actividad no tiene un ID válido."
      );

      return;

    }


    try {

      const response =
        await fetchAutenticado(
          `${API_URL}/agenda/${encodeURIComponent(id)}`,
          {
            method: "DELETE",

            credentials: "include",

            headers: {
              "Accept":
                "application/json"
            }
          }
        );


      if (!response.ok) {

        const mensaje =
          await response.text();

        throw new Error(
          mensaje ||
          `Error HTTP ${response.status}`
        );

      }


      cerrarModal(
        modalEliminarAgenda
      );


      agendaSeleccionada =
        null;


      await cargarAgenda();


      alert(
        "La actividad fue eliminada correctamente."
      );


    } catch (error) {

      console.error(
        "Error eliminando agenda:",
        error
      );


      alert(
        "No se pudo eliminar la actividad.\n\n" +
        error.message
      );

    }

  }
);


/* =========================================================
   BUSCADOR
========================================================= */

buscadorAgenda?.addEventListener(
  "input",
  renderizarAgenda
);


/* =========================================================
   FILTRO LUGAR
========================================================= */

filtroLugar?.addEventListener(
  "change",
  renderizarAgenda
);


/* =========================================================
   FILTRO FECHA
========================================================= */

filtroFecha?.addEventListener(
  "change",
  renderizarAgenda
);


/* =========================================================
   CERRAR MODALES AL HACER CLICK
   FUERA DEL MODAL
========================================================= */

[
  modalCrearAgenda,
  modalEditarAgenda,
  modalEliminarAgenda
].forEach(modal => {

  modal?.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        cerrarModal(modal);

      }

    }
  );

});


/* =========================================================
   ESCAPE PARA CERRAR MODALES
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") return;


    cerrarModal(
      modalCrearAgenda
    );

    cerrarModal(
      modalEditarAgenda
    );

    cerrarModal(
      modalEliminarAgenda
    );

  }
);


/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatearFecha(fecha) {

  if (!fecha) return "-";


  const partes =
    String(fecha).split("-");


  if (partes.length !== 3) {

    return escapeHTML(fecha);

  }


  return `
    ${partes[2]}/${partes[1]}/${partes[0]}
  `;

}


/* =========================================================
   NORMALIZAR FECHA PARA INPUT DATE
========================================================= */

function normalizarFechaInput(fecha) {

  if (!fecha) return "";


  return String(fecha)
    .substring(0, 10);

}


/* =========================================================
   FORMATEAR HORA
========================================================= */

function formatearHora(hora) {

  if (!hora) return "-";


  const partes =
    String(hora).split(":");


  if (partes.length < 2) {

    return escapeHTML(hora);

  }


  return `
    ${partes[0]}:${partes[1]}
  `;

}


/* =========================================================
   NORMALIZAR HORA PARA INPUT TIME
========================================================= */

function normalizarHoraInput(hora) {

  if (!hora) return "";


  const partes =
    String(hora).split(":");


  if (partes.length >= 2) {

    return `${partes[0]}:${partes[1]}`;

  }


  return String(hora);

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(valor) {

  return String(valor ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   INICIO DEL MÓDULO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "D_Agenda iniciado correctamente."
    );


    /*
     * 1. PRIMERO:
     * comprobar que existe una sesión válida.
     */
    const sesionValida =
      await verificarSesion();


    if (!sesionValida) {

      return;

    }


    /*
     * 2. INICIAR EL CONTROL PERIÓDICO.
     *
     * Cada minuto se registra actividad.
     */
    iniciarControlSesion();


    /*
     * 3. Registrar actividad
     * inmediatamente al entrar.
     */
    await mantenerSesion();


    /*
     * 4. Cargar agenda solamente
     * si seguimos autenticados.
     */
    if (!redirigiendo) {

      await cargarAgenda();

    }

  }
);

/* =========================================================
   CERRAR SESIÓN
========================================================= */

btnAgendaCerrarSesion?.addEventListener(
  "click",
  async () => {

    try {

      const response =
        await fetch(
          "http://localhost:8080/auth/logout",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Accept": "application/json"
            }
          }
        );


      if (!response.ok) {

        throw new Error(
          `Error HTTP ${response.status}`
        );

      }


      window.location.href =
        "login.html";


    } catch (error) {

      console.error(
        "Error cerrando sesión:",
        error
      );


      alert(
        "No se pudo cerrar la sesión."
      );

    }

  }
);

/* =========================================================
   MENÚ DEL PERFIL
========================================================= */

btnAgendaPerfil?.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    agendaPerfilMenu?.classList.toggle(
      "visible"
    );

  }
);


document.addEventListener(
  "click",
  event => {

    if (
      agendaPerfil &&
      !agendaPerfil.contains(event.target)
    ) {

      agendaPerfilMenu?.classList.remove(
        "visible"
      );

    }

  }
);

/* =========================================================
   AL ABANDONAR LA PÁGINA
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    detenerControlSesion();

  }
);

