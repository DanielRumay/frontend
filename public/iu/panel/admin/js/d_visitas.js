/* =========================================================
   D_VISITAS.JS
   GESTIÓN DE VISITAS
========================================================= */

let visitasGlobal = [];
let visitaEliminarId = null;


/* =========================================================
   CONFIGURACIÓN API
========================================================= */

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

const LOGIN_URL = "../error.html";

const INTERVALO_SESION = 60 * 1000; // 1 minuto

let intervaloSesion = null;

// Controla si el sistema ya está redirigiendo al login
let redirigiendo = false;

/* =========================================================
   ELEMENTOS PRINCIPALES
========================================================= */

const tablaVisitas =
  document.getElementById("tablaVisitas");

const buscarVisita =
  document.getElementById("buscarVisita");

const btnCrearVisita =
  document.getElementById("btnCrearVisita");


/* =========================================================
   MODAL CREAR
========================================================= */

const modalCrearVisita =
  document.getElementById("modalCrearVisita");

const formCrearVisita =
  document.getElementById("formCrearVisita");


/* =========================================================
   MODAL EDITAR
========================================================= */

const modalEditarVisita =
  document.getElementById("modalEditarVisita");

const formEditarVisita =
  document.getElementById("formEditarVisita");


/* =========================================================
   MODAL ELIMINAR
========================================================= */

const modalEliminarVisita =
  document.getElementById("modalEliminarVisita");

const confirmarEliminarVisita =
  document.getElementById("confirmarEliminarVisita");

const nombreVisitaEliminar =
  document.getElementById("nombreVisitaEliminar");


/* =========================================================
   PERFIL / MENÚ DE USUARIO
========================================================= */

function configurarPerfil() {

  const btnPerfil =
    document.getElementById("btnPerfil");

  const menuPerfil =
    document.getElementById("menuPerfil");

  const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");


  // Si algún elemento no existe,
  // no continuamos.

  if (
    !btnPerfil ||
    !menuPerfil
  ) {

    console.warn(
      "No se encontró el botón o menú de perfil."
    );

    return;

  }


  // =====================================================
  // ABRIR / CERRAR MENÚ
  // =====================================================

  btnPerfil.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();


      const abierto =
        menuPerfil.classList.toggle("visible");


      btnPerfil.setAttribute(
        "aria-expanded",
        abierto ? "true" : "false"
      );

    }
  );


  // =====================================================
  // EVITAR QUE EL CLICK DENTRO DEL MENÚ LO CIERRE
  // =====================================================

  menuPerfil.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

    }
  );


  // =====================================================
  // CLICK FUERA
  // =====================================================

  document.addEventListener(
    "click",
    () => {

      menuPerfil.classList.remove("visible");

      btnPerfil.setAttribute(
        "aria-expanded",
        "false"
      );

    }
  );


  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener(
      "click",
      cerrarSesion
    );

  }

}

/* =========================================================
   MOSTRAR DATOS DEL PERFIL
========================================================= */

function mostrarPerfil(usuario) {

  if (!usuario) {
    return;
  }


  const nombrePerfil =
    document.getElementById("nombrePerfil");

  const rolPerfil =
    document.getElementById("rolPerfil");

  const fotoPerfil =
    document.getElementById("fotoPerfil");


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

  if (fotoPerfil) {

    const foto =
      usuario.fotoPerfil;

    if (foto) {

      fotoPerfil.src =
        foto;

    }

  }

}


/* =========================================================
   CERRAR SESIÓN
========================================================= */

async function cerrarSesion() {

  const btnCerrarSesion =
    document.getElementById(
      "btnCerrarSesion"
    );


  if (!btnCerrarSesion) {
    return;
  }


  if (redirigiendo) {
    return;
  }


  btnCerrarSesion.disabled = true;


  try {

    const respuesta =
      await fetch(
        `${API_URL}/usuarios/logout`,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store"
        }
      );


    /*
     * Tanto una respuesta correcta como
     * una sesión ya expirada significan
     * que debemos regresar al login.
     */

    if (
      respuesta.ok ||
      respuesta.status === 401
    ) {

      redirigirLogin();

      return;

    }


    throw new Error(
      `HTTP ${respuesta.status}`
    );


  } catch (error) {

    console.error(
      "Error cerrando sesión:",
      error
    );


    if (redirigiendo) {
      return;
    }


    btnCerrarSesion.disabled = false;


    alert(
      "No se pudo cerrar la sesión. Intente nuevamente."
    );

  }

}

/* =========================================================
   REDIRECCIÓN AL LOGIN
========================================================= */

function redirigirLogin() {

  if (redirigiendo) {
    return;
  }


  redirigiendo = true;


  // Detener verificación periódica

  detenerControlSesion();


  // Evitar que el usuario siga interactuando

  document.body.style.pointerEvents =
    "none";


  // Volver al inicio de sesión

  window.location.replace(
    LOGIN_URL
  );

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
    // MOSTRAR PERFIL
    // =============================================

    mostrarPerfil(usuario);


    // =============================================
    // VALIDAR USUARIO ACTIVO
    // =============================================

    if (
      !usuario ||
      usuario.activo !== true
    ) {

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
        `${API_URL}/usuarios/actividad`,
        {
          method: "POST",
          credentials: "include"
        }
      );


    // =============================================
    // SESIÓN EXPIRADA O USUARIO INACTIVO
    // =============================================

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

  if (intervaloSesion !== null) {

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
        credentials: "include"
      }
    );


  // =============================================
  // CUALQUIER 401 = SALIR DEL DASHBOARD
  // =============================================

  if (response.status === 401) {

    redirigirLogin();

    throw new Error(
      "Sesión inválida o usuario inactivo."
    );

  }


  return response;

}

/* =========================================================
   CARGAR VISITAS
========================================================= */

async function cargarVisitas() {

  try {

    console.log("Cargando visitas...");

    const response =
      await fetchAutenticado(
        `${API_URL}/visitas`,
        {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });


    console.log(
      "Estado visitas:",
      response.status
    );


    if (response.status === 401) {
      redirigirLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Error HTTP ${response.status}`
      );
    }


    const datos =
      await response.json();


    if (!Array.isArray(datos)) {

      throw new Error(
        "La respuesta de /visitas no es una lista."
      );

    }


    console.log(
      "Visitas recibidas:",
      datos
    );


    visitasGlobal = datos;

    renderizarVisitas();


  } catch (error) {

    console.error(
      "Error cargando visitas:",
      error
    );


    if (tablaVisitas) {

      tablaVisitas.innerHTML = `
                <tr>
                    <td colspan="10" class="visitas-error">

                        <i class="bi bi-exclamation-circle"></i>

                        <span>
                            No se pudieron cargar las visitas.
                        </span>

                    </td>
                </tr>
            `;

    }

  }

}


/* =========================================================
   RENDERIZAR VISITAS
========================================================= */

function renderizarVisitas() {

  if (!tablaVisitas) {

    console.warn(
      "No existe #tablaVisitas"
    );

    return;

  }


  const texto =
    buscarVisita
      ? buscarVisita.value.toLowerCase().trim()
      : "";


  const registros =
    visitasGlobal.filter(visita => {

      const nombre =
        String(
          visita.nombreVisitante || ""
        ).toLowerCase();


      const dni =
        String(
          visita.dniVisitante || ""
        ).toLowerCase();


      const funcionario =
        String(
          visita.funcionarioVisitado || ""
        ).toLowerCase();


      const motivo =
        String(
          visita.motivo || ""
        ).toLowerCase();


      const lugar =
        String(
          visita.lugarEspecificoVisita || ""
        ).toLowerCase();


      return (
        !texto ||
        nombre.includes(texto) ||
        dni.includes(texto) ||
        funcionario.includes(texto) ||
        motivo.includes(texto) ||
        lugar.includes(texto)
      );

    });


  /* =====================================================
     SIN REGISTROS
  ===================================================== */

  if (registros.length === 0) {

    tablaVisitas.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    class="visitas-sin-registros"
                >

                    <i class="bi bi-person-x"></i>

                    <div>
                        No hay visitas registradas.
                    </div>

                </td>
            </tr>
        `;

    return;

  }


  /* =====================================================
     FILAS
  ===================================================== */

  tablaVisitas.innerHTML =
    registros.map((visita, index) => {

      const idReal = obtenerIdVisita(visita);
      const idVisual = index + 1;


      const fecha =
        formatearFecha(
          visita.fechaRegistro
        );


      const nombre =
        visita.nombreVisitante || "-";


      const dni =
        visita.dniVisitante || "-";


      const funcionario =
        visita.funcionarioVisitado || "-";


      const entrada =
        visita.horaEntradaRegistrada || "-";


      const salida =
        visita.horaSalidaRegistrada || "-";


      const lugar =
        visita.lugarEspecificoVisita || "-";


      const motivo =
        visita.motivo || "-";


      return `
                <tr>

                    <!-- ID -->

                    <td>
                        <span class="visita-id">
                            ${idVisual}
                        </span>
                    </td>


                    <!-- VISITANTE -->

                    <td>

                        <div class="visita-persona">

                            <div class="visita-persona-icono">
                                <i class="bi bi-person-fill"></i>
                            </div>

                            <div class="visita-persona-info">

                                <strong>
                                    ${escapeHTML(nombre)}
                                </strong>

                            </div>

                        </div>

                    </td>


                    <!-- DNI -->

                    <td>
                        ${escapeHTML(dni)}
                    </td>


                    <!-- FUNCIONARIO -->

                    <td>

                        <div class="visita-funcionario">

                            <i class="bi bi-person-badge-fill"></i>

                            <span>
                                ${escapeHTML(funcionario)}
                            </span>

                        </div>

                    </td>


                    <!-- FECHA -->

                    <td>
                        ${escapeHTML(fecha)}
                    </td>


                    <!-- ENTRADA -->

                    <td>

                        <span class="visita-hora visita-hora-entrada">

                            <i class="bi bi-box-arrow-in-right"></i>

                            ${escapeHTML(entrada)}

                        </span>

                    </td>


                    <!-- SALIDA -->

                    <td>

                        <span class="visita-hora visita-hora-salida">

                            <i class="bi bi-box-arrow-right"></i>

                            ${escapeHTML(salida)}

                        </span>

                    </td>


                    <!-- LUGAR -->

                    <td>

                        <div class="visita-lugar">

                            <i class="bi bi-geo-alt-fill"></i>

                            <span>
                                ${escapeHTML(lugar)}
                            </span>

                        </div>

                    </td>


                    <!-- MOTIVO -->

                    <td>

                        <span class="visita-motivo">

                            ${escapeHTML(motivo)}

                        </span>

                    </td>


                    <!-- ACCIONES -->

                    <td>

                        <div class="visitas-acciones">

                            <button
                                type="button"
                                class="visita-btn-accion visita-btn-ver"
                                title="Ver visita"
                                data-id="${escapeHTML(idReal)}">

                                <i class="bi bi-eye-fill"></i>

                            </button>


                            <button
                                type="button"
                                class="visita-btn-accion visita-btn-editar"
                                title="Editar visita"
                                data-id="${escapeHTML(idReal)}">

                                <i class="bi bi-pencil-fill"></i>

                            </button>


                            <button
                                type="button"
                                class="visita-btn-accion visita-btn-eliminar"
                                title="Eliminar visita"
                                data-id="${escapeHTML(idReal)}">

                                <i class="bi bi-trash3-fill"></i>

                            </button>

                        </div>

                    </td>

                </tr>
            `;

    }).join("");


  /* =====================================================
     EVENTOS DE ACCIONES
  ===================================================== */

  tablaVisitas
    .querySelectorAll(".visita-btn-ver")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          verVisita(
            button.dataset.id
          );

        }
      );

    });


  tablaVisitas
    .querySelectorAll(".visita-btn-editar")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          editarVisita(
            button.dataset.id
          );

        }
      );

    });


  tablaVisitas
    .querySelectorAll(".visita-btn-eliminar")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          eliminarVisita(
            button.dataset.id
          );

        }
      );

    });

}


/* =========================================================
   OBTENER ID
========================================================= */

function obtenerIdVisita(visita) {

  return (
    visita.id ||
    visita._id ||
    visita.idVisita ||
    ""
  );

}


/* =========================================================
   REGISTRAR VISITA
========================================================= */

async function registrarVisita(event) {

  event.preventDefault();


  try {

    const fechaRegistro =
      document.getElementById(
        "crearFecha"
      )?.value.trim();


    const nombreVisitante =
      document.getElementById(
        "crearVisitante"
      )?.value.trim();


    const dniVisitante =
      document.getElementById(
        "crearDni"
      )?.value.trim();


    const funcionarioVisitado =
      document.getElementById(
        "crearFuncionario"
      )?.value.trim();


    const lugarEspecificoVisita =
      document.getElementById(
        "crearLugar"
      )?.value.trim();


    const horaEntradaRegistrada =
      document.getElementById(
        "crearEntrada"
      )?.value.trim();


    const horaSalidaRegistrada =
      document.getElementById(
        "crearSalida"
      )?.value.trim();


    const motivo =
      document.getElementById(
        "crearMotivo"
      )?.value.trim();


    /* =================================================
       VALIDACIONES
    ================================================= */

    if (!nombreVisitante) {

      alert(
        "Ingrese el nombre del visitante."
      );

      return;

    }


    if (!visita.dniVisitante) {
      alert("Ingrese el DNI del visitante.");
      return;
    }


    if (!/^\d{8}$/.test(visita.dniVisitante)) {
      alert("El DNI debe contener exactamente 8 dígitos.");
      return;
    }


    if (!funcionarioVisitado) {

      alert(
        "Ingrese el funcionario visitado."
      );

      return;

    }


    if (!lugarEspecificoVisita) {

      alert(
        "Ingrese el lugar específico de la visita."
      );

      return;

    }


    if (!fechaRegistro) {

      alert(
        "Ingrese la fecha de registro."
      );

      return;

    }


    if (!horaEntradaRegistrada) {

      alert(
        "Ingrese la hora de entrada."
      );

      return;

    }


    if (!motivo) {

      alert(
        "Ingrese el motivo de la visita."
      );

      return;

    }


    /* =================================================
       OBJETO
    ================================================= */

    const visita = {

      fechaRegistro:
        fechaRegistro ||
        obtenerFechaActual(),

      nombreVisitante,

      dniVisitante,

      funcionarioVisitado,

      horaEntradaRegistrada,

      horaSalidaRegistrada,

      motivo,

      lugarEspecificoVisita

    };


    console.log(
      "Enviando visita:",
      visita
    );


    /* =================================================
       POST
    ================================================= */

    const response =
      await fetchAutenticado(
        `${API_URL}/visitas`,
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
            JSON.stringify(visita)
        }
      );


    console.log(
      "Estado registro:",
      response.status
    );


    if (!response.ok) {

      throw await obtenerErrorRespuesta(
        response
      );

    }


    const resultado =
      await response.json();


    console.log(
      "Visita registrada:",
      resultado
    );


    cerrarModal(
      modalCrearVisita
    );


    formCrearVisita?.reset();


    await cargarVisitas();


    alert(
      "Visita registrada correctamente."
    );


  } catch (error) {

    console.error(
      "Error registrando visita:",
      error
    );


    alert(
      "No se pudo registrar la visita.\n\n" +
      error.message
    );

  }

}


/* =========================================================
   VER VISITA
========================================================= */

function verVisita(id) {

  const visita =
    visitasGlobal.find(
      item =>
        String(
          obtenerIdVisita(item)
        ) === String(id)
    );


  if (!visita) {

    alert(
      "No se encontró la visita."
    );

    return;

  }


  const mensaje =

    `Visitante: ${visita.nombreVisitante || "-"}\n` +

    `DNI: ${visita.dniVisitante || "-"}\n` +

    `Funcionario: ${visita.funcionarioVisitado || "-"}\n` +

    `Fecha: ${formatearFecha(visita.fechaRegistro)}\n` +

    `Entrada: ${visita.horaEntradaRegistrada || "-"}\n` +

    `Salida: ${visita.horaSalidaRegistrada || "-"}\n` +

    `Lugar: ${visita.lugarEspecificoVisita || "-"}\n` +

    `Motivo: ${visita.motivo || "-"}`;


  alert(mensaje);

}


/* =========================================================
   EDITAR VISITA
========================================================= */

function editarVisita(id) {

  const visita =
    visitasGlobal.find(
      item =>
        String(
          obtenerIdVisita(item)
        ) === String(id)
    );


  if (!visita) {

    alert(
      "No se encontró la visita."
    );

    return;

  }


  document.getElementById(
    "editarVisitaId"
  ).value =
    obtenerIdVisita(visita);


  document.getElementById(
    "editarVisitante"
  ).value =
    visita.nombreVisitante || "";


  document.getElementById(
    "editarDni"
  ).value =
    visita.dniVisitante || "";


  document.getElementById(
    "editarFuncionario"
  ).value =
    visita.funcionarioVisitado || "";


  document.getElementById(
    "editarLugar"
  ).value =
    visita.lugarEspecificoVisita || "";


  document.getElementById(
    "editarFecha"
  ).value =
    normalizarFechaInput(
      visita.fechaRegistro
    );


  document.getElementById(
    "editarEntrada"
  ).value =
    visita.horaEntradaRegistrada || "";


  document.getElementById(
    "editarSalida"
  ).value =
    visita.horaSalidaRegistrada || "";


  document.getElementById(
    "editarMotivo"
  ).value =
    visita.motivo || "";


  abrirModal(
    modalEditarVisita
  );

}


/* =========================================================
   GUARDAR CAMBIOS
========================================================= */

async function guardarCambiosVisita(event) {

  event.preventDefault();


  const id =
    document.getElementById(
      "editarVisitaId"
    )?.value.trim();


  if (!id) {

    alert(
      "No se encontró el ID de la visita."
    );

    return;

  }


  try {

    const visita = {

      fechaRegistro:
      document.getElementById(
        "editarFecha"
      ).value,

      nombreVisitante:
        document.getElementById(
          "editarVisitante"
        ).value.trim(),

      dniVisitante:
        document.getElementById(
          "editarDni"
        ).value.trim(),

      funcionarioVisitado:
        document.getElementById(
          "editarFuncionario"
        ).value.trim(),

      lugarEspecificoVisita:
        document.getElementById(
          "editarLugar"
        ).value.trim(),

      horaEntradaRegistrada:
      document.getElementById(
        "editarEntrada"
      ).value,

      horaSalidaRegistrada:
      document.getElementById(
        "editarSalida"
      ).value,

      motivo:
        document.getElementById(
          "editarMotivo"
        ).value.trim()

    };


    if (!visita.nombreVisitante) {

      alert(
        "Ingrese el nombre del visitante."
      );

      return;

    }


    if (!/^\d{8}$/.test(
      visita.dniVisitante
    )) {

      alert(
        "El DNI debe contener exactamente 8 dígitos."
      );

      return;

    }


    if (!visita.funcionarioVisitado) {

      alert(
        "Ingrese el funcionario visitado."
      );

      return;

    }


    if (!visita.lugarEspecificoVisita) {

      alert(
        "Ingrese el lugar de la visita."
      );

      return;

    }


    if (!visita.fechaRegistro) {

      alert(
        "Ingrese la fecha."
      );

      return;

    }


    if (!visita.horaEntradaRegistrada) {

      alert(
        "Ingrese la hora de entrada."
      );

      return;

    }


    if (!visita.motivo) {

      alert(
        "Ingrese el motivo."
      );

      return;

    }


    console.log(
      "Actualizando visita:",
      id,
      visita
    );


    const response =
      await fetchAutenticado(
        `${API_URL}/visitas/${encodeURIComponent(id)}`,
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
            JSON.stringify(visita)
        }
      );


    console.log(
      "Estado actualización:",
      response.status
    );


    if (!response.ok) {

      throw await obtenerErrorRespuesta(
        response
      );

    }


    const resultado =
      await response.json();


    console.log(
      "Visita actualizada:",
      resultado
    );


    cerrarModal(
      modalEditarVisita
    );


    await cargarVisitas();


    alert(
      "Visita modificada correctamente."
    );


  } catch (error) {

    console.error(
      "Error modificando visita:",
      error
    );


    alert(
      "No se pudo modificar la visita.\n\n" +
      error.message
    );

  }

}


/* =========================================================
   ABRIR ELIMINAR
========================================================= */

function eliminarVisita(id) {

  const visita =
    visitasGlobal.find(
      item =>
        String(
          obtenerIdVisita(item)
        ) === String(id)
    );


  if (!visita) {

    alert(
      "No se encontró la visita."
    );

    return;

  }


  visitaEliminarId =
    obtenerIdVisita(visita);


  if (nombreVisitaEliminar) {

    nombreVisitaEliminar.textContent =
      visita.nombreVisitante || "Visitante";

  }


  abrirModal(
    modalEliminarVisita
  );

}


/* =========================================================
   CONFIRMAR ELIMINACIÓN
========================================================= */

async function confirmarEliminacion() {

  if (!visitaEliminarId) {

    alert(
      "No se encontró el ID de la visita."
    );

    return;

  }


  try {

    console.log(
      "Eliminando visita:",
      visitaEliminarId
    );


    const response =
      await fetchAutenticado(
        `${API_URL}/visitas/${encodeURIComponent(visitaEliminarId)}`,
        {
          method: "DELETE",

          credentials: "include",

          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    console.log(
      "Estado eliminación:",
      response.status
    );


    if (!response.ok) {

      throw await obtenerErrorRespuesta(
        response
      );

    }


    cerrarModal(
      modalEliminarVisita
    );


    visitaEliminarId = null;


    await cargarVisitas();


    alert(
      "Visita eliminada correctamente."
    );


  } catch (error) {

    console.error(
      "Error eliminando visita:",
      error
    );


    alert(
      "No se pudo eliminar la visita.\n\n" +
      error.message
    );

  }

}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal(modal) {

  if (!modal) return;


  modal.classList.add(
    "mostrar"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   CERRAR MODAL
========================================================= */

function cerrarModal(modal) {

  if (!modal) return;


  modal.classList.remove(
    "mostrar"
  );


  document.body.style.overflow =
    "";

}


/* =========================================================
   OBTENER ERROR API
========================================================= */

async function obtenerErrorRespuesta(response) {

  let mensaje =
    `Error HTTP ${response.status}`;


  try {

    const texto =
      await response.text();


    if (texto) {

      try {

        const datos =
          JSON.parse(texto);


        mensaje =
          datos.message ||
          datos.error ||
          datos.mensaje ||
          texto;

      } catch (_) {

        mensaje = texto;

      }

    }

  } catch (_) {

    // No se pudo leer la respuesta.
  }


  return new Error(
    mensaje
  );

}


/* =========================================================
   BOTÓN CREAR
========================================================= */

btnCrearVisita?.addEventListener(
  "click",
  () => {

    formCrearVisita?.reset();

    const fecha =
      document.getElementById(
        "crearFecha"
      );

    if (fecha && !fecha.value) {

      fecha.value =
        obtenerFechaActual();

    }

    abrirModal(
      modalCrearVisita
    );

  }
);


/* =========================================================
   FORMULARIO CREAR
========================================================= */

formCrearVisita?.addEventListener(
  "submit",
  registrarVisita
);


/* =========================================================
   FORMULARIO EDITAR
========================================================= */

formEditarVisita?.addEventListener(
  "submit",
  guardarCambiosVisita
);


/* =========================================================
   CONFIRMAR ELIMINAR
========================================================= */

confirmarEliminarVisita?.addEventListener(
  "click",
  confirmarEliminacion
);


/* =========================================================
   CERRAR CREAR
========================================================= */

document
  .getElementById("cerrarCrearVisita")
  ?.addEventListener(
    "click",
    () => {

      cerrarModal(
        modalCrearVisita
      );

    }
  );


document
  .getElementById("cancelarCrearVisita")
  ?.addEventListener(
    "click",
    () => {

      cerrarModal(
        modalCrearVisita
      );

    }
  );


/* =========================================================
   CERRAR EDITAR
========================================================= */

document
  .getElementById("cerrarEditarVisita")
  ?.addEventListener(
    "click",
    () => {

      cerrarModal(
        modalEditarVisita
      );

    }
  );


document
  .getElementById("cancelarEditarVisita")
  ?.addEventListener(
    "click",
    () => {

      cerrarModal(
        modalEditarVisita
      );

    }
  );


/* =========================================================
   CERRAR ELIMINAR
========================================================= */

document
  .getElementById("cancelarEliminarVisita")
  ?.addEventListener(
    "click",
    () => {

      visitaEliminarId = null;

      cerrarModal(
        modalEliminarVisita
      );

    }
  );


/* =========================================================
   CERRAR MODALES HACIENDO CLICK AFUERA
========================================================= */

[
  modalCrearVisita,
  modalEditarVisita,
  modalEliminarVisita
]
  .forEach(modal => {

    modal?.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          cerrarModal(
            modal
          );

          if (
            modal ===
            modalEliminarVisita
          ) {

            visitaEliminarId =
              null;

          }

        }

      }
    );

  });


/* =========================================================
   BUSCADOR
========================================================= */

buscarVisita?.addEventListener(
  "input",
  renderizarVisitas
);


/* =========================================================
   OBTENER FECHA ACTUAL
========================================================= */

function obtenerFechaActual() {

  const ahora =
    new Date();


  const año =
    ahora.getFullYear();


  const mes =
    String(
      ahora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const dia =
    String(
      ahora.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${año}-${mes}-${dia}`;

}


/* =========================================================
   NORMALIZAR FECHA PARA INPUT DATE
========================================================= */

function normalizarFechaInput(fecha) {

  if (!fecha) {
    return "";
  }


  const valor =
    String(fecha);


  /*
   * Ya viene como:
   * YYYY-MM-DD
   */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {

    return valor;

  }


  /*
   * Si viene como ISO:
   * YYYY-MM-DDTHH:mm:ss...
   */

  if (
    /^\d{4}-\d{2}-\d{2}T/.test(valor)
  ) {

    return valor.substring(
      0,
      10
    );

  }


  return "";

}


/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatearFecha(fecha) {

  if (!fecha) {

    return "-";

  }


  const valor =
    String(fecha);


  /*
   * ISO
   */

  if (
    /^\d{4}-\d{2}-\d{2}T/.test(valor)
  ) {

    const fechaParte =
      valor.substring(
        0,
        10
      );

    const partes =
      fechaParte.split("-");


    if (partes.length === 3) {

      return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }

  }


  const partes =
    valor.split("-");


  if (partes.length !== 3) {

    return valor;

  }


  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(valor) {

  return String(valor)
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
   INICIO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /*
     * PRIMERO:
     * configurar menú de perfil.
     */

    configurarPerfil();


    /*
     * SEGUNDO:
     * comprobar sesión.
     */

    const sesionValida =
      await verificarSesion();


    if (!sesionValida) {
      return;
    }


    /*
     * TERCERO:
     * iniciar mantenimiento de sesión.
     */

    iniciarControlSesion();


    /*
     * CUARTO:
     * registrar actividad inmediatamente.
     */

    await mantenerSesion();


    /*
     * QUINTO:
     * cargar visitas.
     */

    if (!redirigiendo) {

      await cargarVisitas();

    }

  }
);


/* =========================================================
   FUNCIONES GLOBALES
========================================================= */

window.verVisita =
  verVisita;

window.editarVisita =
  editarVisita;

window.eliminarVisita =
  eliminarVisita;

window.addEventListener(
  "beforeunload",
  () => {

    detenerControlSesion();

  }
);
