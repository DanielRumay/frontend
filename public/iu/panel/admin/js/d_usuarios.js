// =========================================================
// GESTIÓN DE USUARIOS
// CONTROL DE SESIÓN + CRUD
// =========================================================


// =========================================================
// CONFIGURACIÓN
// =========================================================

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

const LOGIN_URL = "../error.html";

const INTERVALO_SESION = 60 * 1000; // 1 minuto

let intervaloSesion = null;


// =========================================================
// VARIABLES
// =========================================================

let usuariosGlobal = [];

let usuarioEditando = null;

let usuarioEliminando = null;

// Controla si el sistema ya está redirigiendo al login
let redirigiendo = false;


// =========================================================
// ELEMENTOS - TABLA Y FILTROS
// =========================================================

const tablaUsuarios =
  document.getElementById("tablaUsuarios");

const buscador =
  document.getElementById("buscarUsuario");

const filtroRol =
  document.getElementById("filtroRol");

const filtroEstado =
  document.getElementById("filtroEstado");


// =========================================================
// ELEMENTOS - CREAR
// =========================================================

const btnCrearUsuario =
  document.getElementById("btnCrearUsuario");

const modalCrear =
  document.getElementById("modalCrear");

const cerrarCrear =
  document.getElementById("cerrarCrear");

const cancelarCrear =
  document.getElementById("cancelarCrear");

const formCrearUsuario =
  document.getElementById("formCrearUsuario");

const crearNombres =
  document.getElementById("crearNombres");

const crearApellidos =
  document.getElementById("crearApellidos");

const crearCorreo =
  document.getElementById("crearCorreo");

const crearUsuario =
  document.getElementById("crearUsuario");

const crearPassword =
  document.getElementById("crearPassword");

const crearRol =
  document.getElementById("crearRol");

const mostrarPasswordCrear =
  document.getElementById("mostrarPasswordCrear");


// =========================================================
// ELEMENTOS - EDITAR
// =========================================================

const modalEditar =
  document.getElementById("modalEditar");

const cerrarEditar =
  document.getElementById("cerrarEditar");

const cancelarEditar =
  document.getElementById("cancelarEditar");

const formEditarUsuario =
  document.getElementById("formEditarUsuario");


const editarNombres =
  document.getElementById("editarNombres");

const editarApellidos =
  document.getElementById("editarApellidos");

const editarCorreo =
  document.getElementById("editarCorreo");

const editarUsuario =
  document.getElementById("editarUsuario");

const editarPassword =
  document.getElementById("editarPassword");

const editarRol =
  document.getElementById("editarRol");


// =========================================================
// ELEMENTOS - ELIMINAR
// =========================================================

const modalEliminar =
  document.getElementById("modalEliminar");

const cancelarEliminar =
  document.getElementById("cancelarEliminar");

const confirmarEliminar =
  document.getElementById("confirmarEliminar");

const nombreEliminar =
  document.getElementById("nombreEliminar");

// =========================================================
// ELEMENTOS - PERFIL
// =========================================================

const usuarioMenu =
  document.getElementById("usuarioMenu");

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

// =========================================================
// REDIRECCIÓN AL LOGIN
// =========================================================

function redirigirLogin() {

  if (redirigiendo) {
    return;
  }

  redirigiendo = true;


  // Detener verificación periódica

  detenerControlSesion();


  // Evitar que el usuario siga interactuando

  document.body.style.pointerEvents = "none";


  // Volver al inicio de sesión

  window.location.replace(LOGIN_URL);

}


// =========================================================
// VERIFICAR SESIÓN
// =========================================================

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


// =========================================================
// MANTENER SESIÓN ACTIVA
// =========================================================

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


// =========================================================
// INICIAR CONTROL DE SESIÓN
// =========================================================

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


// =========================================================
// DETENER CONTROL DE SESIÓN
// =========================================================

function detenerControlSesion() {

  if (intervaloSesion !== null) {

    clearInterval(intervaloSesion);

    intervaloSesion = null;

  }

}


// =========================================================
// FETCH AUTENTICADO
// =========================================================

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


// =========================================================
// CARGAR USUARIOS
// =========================================================

async function cargarUsuarios() {

  try {

    const response =
      await fetchAutenticado(
        `${API_URL}/usuarios`,
        {
          method: "GET"
        }
      );


    if (!response.ok) {

      throw new Error(
        "No se pudieron obtener los usuarios."
      );

    }


    usuariosGlobal =
      await response.json();


    console.log(
      "Usuarios cargados:",
      usuariosGlobal
    );


    renderizarUsuarios();


  } catch (error) {

    console.error(
      "Error cargando usuarios:",
      error
    );


    if (redirigiendo) {
      return;
    }


    if (tablaUsuarios) {

      tablaUsuarios.innerHTML = `
        <tr>
          <td colspan="7" class="sin-registros">
            <i class="bi bi-exclamation-circle"></i>
            No se pudieron cargar los usuarios.
          </td>
        </tr>
      `;

    }

  }

}


// =========================================================
// RENDERIZAR USUARIOS
// =========================================================

function renderizarUsuarios() {

  if (!tablaUsuarios) return;


  const texto =
    buscador
      ? buscador.value.toLowerCase().trim()
      : "";


  const rolSeleccionado =
    filtroRol
      ? filtroRol.value
      : "";


  const estadoSeleccionado =
    filtroEstado
      ? filtroEstado.value
      : "";


  const usuariosFiltrados =
    usuariosGlobal.filter(usuario => {

      const nombreCompleto =
        `${usuario.nombres || ""} ${usuario.apellidos || ""}`
          .toLowerCase();


      const correo =
        (usuario.correo || "")
          .toLowerCase();


      const nombreUsuario =
        (usuario.usuario || "")
          .toLowerCase();


      const coincideBusqueda =
        !texto ||
        nombreCompleto.includes(texto) ||
        correo.includes(texto) ||
        nombreUsuario.includes(texto);


      const coincideRol =
        !rolSeleccionado ||
        usuario.rol === rolSeleccionado;


      let coincideEstado = true;


      if (estadoSeleccionado === "true") {

        coincideEstado =
          usuario.activo === true;

      }


      if (estadoSeleccionado === "false") {

        coincideEstado =
          usuario.activo === false;

      }


      return (
        coincideBusqueda &&
        coincideRol &&
        coincideEstado
      );

    });


  if (usuariosFiltrados.length === 0) {

    tablaUsuarios.innerHTML = `
      <tr>
        <td colspan="7" class="sin-registros">
          <i class="bi bi-people"></i>
          No se encontraron usuarios.
        </td>
      </tr>
    `;

    return;

  }


  tablaUsuarios.innerHTML =
    usuariosFiltrados.map((usuario, index) => {

      const nombreCompleto =
        `${usuario.nombres || ""} ${usuario.apellidos || ""}`;


      let rolTexto =
        "Personal administrativo";

      let claseRol =
        "badge-personal";


      if (usuario.rol === "ADMIN") {

        rolTexto =
          "Administrador";

        claseRol =
          "badge-admin";

      }


      const estadoTexto =
        usuario.activo
          ? "Activo"
          : "Inactivo";


      const claseEstado =
        usuario.activo
          ? "activo"
          : "inactivo";


      return `
        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            <div class="nombre-usuario">

              <div class="avatar-usuario">
                <i class="bi bi-person-fill"></i>
              </div>

              <strong>
                ${nombreCompleto}
              </strong>

            </div>
          </td>

          <td>
            ${usuario.correo || "-"}
          </td>

          <td>
            ${usuario.usuario || "-"}
          </td>

          <td>
            <span class="badge ${claseRol}">
              ${rolTexto}
            </span>
          </td>

          <td>
            <span class="estado ${claseEstado}">
              ${estadoTexto}
            </span>
          </td>

          <td>

            <div class="acciones">

              <button
                type="button"
                class="btn-accion btn-editar"
                data-accion="editar"
                data-id="${usuario.id}"
                title="Modificar">

                <i class="bi bi-pencil-fill"></i>

              </button>


              <button
                type="button"
                class="btn-accion btn-eliminar"
                data-accion="eliminar"
                data-id="${usuario.id}"
                title="Eliminar">

                <i class="bi bi-trash-fill"></i>

              </button>

            </div>

          </td>

        </tr>
      `;

    }).join("");

}


// =========================================================
// ABRIR MODAL CREAR
// =========================================================

function abrirModalCrear() {

  if (redirigiendo) return;


  formCrearUsuario.reset();


  /*
   * IMPORTANTE:
   *
   * El backend fuerza:
   *
   * usuario.setActivo(false);
   *
   * Por eso no usamos el selector de estado
   * para crear.
   */


  modalCrear.classList.add("mostrar");


  setTimeout(() => {

    crearNombres.focus();

  }, 100);

}


// =========================================================
// CERRAR MODAL CREAR
// =========================================================

function cerrarModalCrear() {

  modalCrear.classList.remove("mostrar");

  formCrearUsuario.reset();

}


// =========================================================
// CREAR USUARIO
// =========================================================

async function registrarUsuario(e) {

  e.preventDefault();


  const datos = {

    nombres:
      crearNombres.value.trim(),

    apellidos:
      crearApellidos.value.trim(),

    correo:
      crearCorreo.value.trim(),

    usuario:
      crearUsuario.value.trim(),

    password:
    crearPassword.value,

    rol:
    crearRol.value,

    /*
     * El backend ignora este valor y fuerza false.
     * Lo enviamos como false para mantener coherencia.
     */

  };


  // =============================================
  // VALIDACIONES
  // =============================================

  if (!datos.nombres) {

    alert("Ingrese los nombres.");

    crearNombres.focus();

    return;

  }


  if (!datos.apellidos) {

    alert("Ingrese los apellidos.");

    crearApellidos.focus();

    return;

  }


  if (!datos.correo) {

    alert("Ingrese el correo.");

    crearCorreo.focus();

    return;

  }


  if (!datos.usuario) {

    alert("Ingrese el nombre de usuario.");

    crearUsuario.focus();

    return;

  }


  if (!datos.password) {

    alert("Ingrese una contraseña.");

    crearPassword.focus();

    return;

  }


  if (datos.password.length < 6) {

    alert(
      "La contraseña debe contener al menos 6 caracteres."
    );

    crearPassword.focus();

    return;

  }


  if (!datos.rol) {

    alert("Seleccione un rol.");

    crearRol.focus();

    return;

  }


  try {

    const response =
      await fetchAutenticado(
        `${API_URL}/usuarios`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(datos)
        }
      );


    if (!response.ok) {

      const texto =
        await response.text();

      console.error(
        "Respuesta del servidor:",
        texto
      );

      throw new Error(
        "No se pudo crear el usuario."
      );

    }


    const usuarioCreado =
      await response.json();


    console.log(
      "Usuario creado:",
      usuarioCreado
    );


    alert(
      "Usuario creado correctamente.\n\n" +
      "El nuevo usuario queda inactivo hasta que inicie sesión."
    );


    cerrarModalCrear();

    await cargarUsuarios();


  } catch (error) {

    console.error(
      "Error creando usuario:",
      error
    );


    if (redirigiendo) {
      return;
    }


    alert(
      "No se pudo crear el usuario."
    );

  }

}


// =========================================================
// ABRIR MODAL EDITAR
// =========================================================

function abrirModalEditar(id) {

  if (redirigiendo) {
    return;
  }


  const usuario =
    usuariosGlobal.find(
      u => String(u.id) === String(id)
    );


  if (!usuario) {

    console.error(
      "No se encontró el usuario con ID:",
      id
    );

    alert(
      "No se encontró el usuario."
    );

    return;

  }


  // =============================================
  // GUARDAR ID DEL USUARIO
  // =============================================

  usuarioEditando =
    usuario.id;


  // =============================================
  // CARGAR DATOS EN EL FORMULARIO
  // =============================================

  if (editarId) {

    editarId.value =
      usuario.id;

  }


  if (editarNombres) {

    editarNombres.value =
      usuario.nombres || "";

  }


  if (editarApellidos) {

    editarApellidos.value =
      usuario.apellidos || "";

  }


  if (editarCorreo) {

    editarCorreo.value =
      usuario.correo || "";

  }


  if (editarUsuario) {

    editarUsuario.value =
      usuario.usuario || "";

  }


  // =============================================
  // PASSWORD
  // =============================================

  if (editarPassword) {

    editarPassword.value = "";

  }


  // =============================================
  // ROL
  // =============================================

  if (editarRol) {

    editarRol.value =
      usuario.rol ||
      "PERSONAL_ADMINISTRATIVO";

  }


  // =============================================
  // ABRIR MODAL
  // =============================================

  if (modalEditar) {

    modalEditar.classList.add("mostrar");

  }


  // =============================================
  // ENFOCAR NOMBRES
  // =============================================

  setTimeout(() => {

    if (editarNombres) {

      editarNombres.focus();

    }

  }, 100);

}


// =========================================================
// CERRAR MODAL EDITAR
// =========================================================

function cerrarModalEditar() {

  modalEditar.classList.remove("mostrar");

  usuarioEditando = null;

  formEditarUsuario.reset();

}


// =========================================================
// MODIFICAR USUARIO
// =========================================================

async function modificarUsuario(e) {

  e.preventDefault();


  if (!usuarioEditando) {

    console.error(
      "No hay ningún usuario seleccionado para editar."
    );

    return;

  }


  // =============================================
  // DATOS A ACTUALIZAR
  // =============================================

  const datos = {

    nombres:
      editarNombres.value.trim(),

    apellidos:
      editarApellidos.value.trim(),

    correo:
      editarCorreo.value.trim(),

    usuario:
      editarUsuario.value.trim(),

    rol:
    editarRol.value

  };


  // =============================================
  // VALIDACIONES
  // =============================================

  if (!datos.nombres) {

    alert("Ingrese los nombres.");

    editarNombres.focus();

    return;

  }


  if (!datos.apellidos) {

    alert("Ingrese los apellidos.");

    editarApellidos.focus();

    return;

  }


  if (!datos.correo) {

    alert("Ingrese el correo.");

    editarCorreo.focus();

    return;

  }


  if (!datos.usuario) {

    alert("Ingrese el nombre de usuario.");

    editarUsuario.focus();

    return;

  }


  if (!datos.rol) {

    alert("Seleccione un rol.");

    editarRol.focus();

    return;

  }


  // =============================================
  // ENVIAR AL BACKEND
  // =============================================

  try {

    const response =
      await fetchAutenticado(
        `${API_URL}/usuarios/${usuarioEditando}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(datos)

        }
      );


    // =============================================
    // ERROR HTTP
    // =============================================

    if (!response.ok) {

      const texto =
        await response.text();

      console.error(
        "Respuesta del servidor:",
        texto
      );

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    // =============================================
    // RESPUESTA
    // =============================================

    let usuarioModificado = null;

    const textoRespuesta =
      await response.text();


    if (textoRespuesta) {

      try {

        usuarioModificado =
          JSON.parse(textoRespuesta);

      } catch (error) {

        console.warn(
          "La respuesta no contiene JSON válido."
        );

      }

    }


    console.log(
      "Usuario modificado:",
      usuarioModificado
    );


    // =============================================
    // CERRAR MODAL
    // =============================================

    cerrarModalEditar();


    // =============================================
    // RECARGAR TABLA
    // =============================================

    await cargarUsuarios();


    alert(
      "Usuario modificado correctamente."
    );


  } catch (error) {

    console.error(
      "Error modificando usuario:",
      error
    );


    if (redirigiendo) {

      return;

    }


    alert(
      "No se pudo modificar el usuario."
    );

  }

}


// =========================================================
// ABRIR MODAL ELIMINAR
// =========================================================

function abrirModalEliminar(id) {

  if (redirigiendo) return;


  const usuario =
    usuariosGlobal.find(
      u => String(u.id) === String(id)
    );


  if (!usuario) {

    alert(
      "No se encontró el usuario."
    );

    return;

  }


  usuarioEliminando =
    usuario.id;


  const nombreCompleto =
    `${usuario.nombres || ""} ${usuario.apellidos || ""}`
      .trim();


  nombreEliminar.textContent =
    nombreCompleto ||
    usuario.usuario ||
    "Usuario";


  modalEliminar.classList.add("mostrar");

}


// =========================================================
// CERRAR MODAL ELIMINAR
// =========================================================

function cerrarModalEliminar() {

  modalEliminar.classList.remove("mostrar");

  usuarioEliminando = null;

}


// =========================================================
// CONFIRMAR ELIMINACIÓN
// =========================================================

async function confirmarEliminacion() {

  if (!usuarioEliminando) {

    return;

  }


  try {

    const response =
      await fetchAutenticado(
        `${API_URL}/usuarios/${usuarioEliminando}`,
        {
          method: "DELETE"
        }
      );


    if (!response.ok) {

      const texto =
        await response.text();

      console.error(
        "Respuesta del servidor:",
        texto
      );

      throw new Error(
        "No se pudo eliminar el usuario."
      );

    }


    alert(
      "Usuario eliminado correctamente."
    );


    cerrarModalEliminar();

    await cargarUsuarios();


  } catch (error) {

    console.error(
      "Error eliminando usuario:",
      error
    );


    if (redirigiendo) {
      return;
    }


    alert(
      "No se pudo eliminar el usuario."
    );

  }

}


// =========================================================
// MOSTRAR / OCULTAR PASSWORD CREAR
// =========================================================

if (mostrarPasswordCrear) {

  mostrarPasswordCrear.addEventListener(
    "click",
    () => {

      if (
        crearPassword.type === "password"
      ) {

        crearPassword.type = "text";

        mostrarPasswordCrear.innerHTML =
          `<i class="bi bi-eye-slash"></i>`;

      } else {

        crearPassword.type = "password";

        mostrarPasswordCrear.innerHTML =
          `<i class="bi bi-eye"></i>`;

      }

    }
  );

}


// =========================================================
// EVENTO BOTÓN CREAR
// =========================================================

if (btnCrearUsuario) {

  btnCrearUsuario.addEventListener(
    "click",
    abrirModalCrear
  );

}


// =========================================================
// FORMULARIO CREAR
// =========================================================

if (formCrearUsuario) {

  formCrearUsuario.addEventListener(
    "submit",
    registrarUsuario
  );

}


// =========================================================
// FORMULARIO EDITAR
// =========================================================

if (formEditarUsuario) {

  formEditarUsuario.addEventListener(
    "submit",
    modificarUsuario
  );

}


// =========================================================
// CERRAR CREAR
// =========================================================

if (cerrarCrear) {

  cerrarCrear.addEventListener(
    "click",
    cerrarModalCrear
  );

}


if (cancelarCrear) {

  cancelarCrear.addEventListener(
    "click",
    cerrarModalCrear
  );

}


// =========================================================
// CERRAR EDITAR
// =========================================================

if (cerrarEditar) {

  cerrarEditar.addEventListener(
    "click",
    cerrarModalEditar
  );

}


if (cancelarEditar) {

  cancelarEditar.addEventListener(
    "click",
    cerrarModalEditar
  );

}


// =========================================================
// CERRAR ELIMINAR
// =========================================================

if (cancelarEliminar) {

  cancelarEliminar.addEventListener(
    "click",
    cerrarModalEliminar
  );

}


if (confirmarEliminar) {

  confirmarEliminar.addEventListener(
    "click",
    confirmarEliminacion
  );

}


// =========================================================
// CERRAR MODALES HACIENDO CLICK AFUERA
// =========================================================

if (modalCrear) {

  modalCrear.addEventListener(
    "click",
    (e) => {

      if (e.target === modalCrear) {

        cerrarModalCrear();

      }

    }
  );

}


if (modalEditar) {

  modalEditar.addEventListener(
    "click",
    (e) => {

      if (e.target === modalEditar) {

        cerrarModalEditar();

      }

    }
  );

}


if (modalEliminar) {

  modalEliminar.addEventListener(
    "click",
    (e) => {

      if (e.target === modalEliminar) {

        cerrarModalEliminar();

      }

    }
  );

}


// =========================================================
// ACCIONES DE LA TABLA
// =========================================================

if (tablaUsuarios) {

  tablaUsuarios.addEventListener(
    "click",
    (e) => {

      const boton =
        e.target.closest(
          "button[data-accion]"
        );


      if (!boton) return;


      const accion =
        boton.dataset.accion;


      const id =
        boton.dataset.id;


      if (accion === "editar") {

        abrirModalEditar(id);

      }


      if (accion === "eliminar") {

        abrirModalEliminar(id);

      }

    }
  );

}


// =========================================================
// FILTRO BUSCADOR
// =========================================================

if (buscador) {

  buscador.addEventListener(
    "input",
    renderizarUsuarios
  );

}


// =========================================================
// FILTRO ROL
// =========================================================

if (filtroRol) {

  filtroRol.addEventListener(
    "change",
    renderizarUsuarios
  );

}


// =========================================================
// FILTRO ESTADO
// =========================================================

if (filtroEstado) {

  filtroEstado.addEventListener(
    "change",
    renderizarUsuarios
  );

}


// =========================================================
// ESCAPE PARA CERRAR MODALES
// =========================================================

document.addEventListener(
  "keydown",
  (e) => {

    if (e.key !== "Escape") return;


    if (
      modalCrear &&
      modalCrear.classList.contains("mostrar")
    ) {

      cerrarModalCrear();

    }


    if (
      modalEditar &&
      modalEditar.classList.contains("mostrar")
    ) {

      cerrarModalEditar();

    }


    if (
      modalEliminar &&
      modalEliminar.classList.contains("mostrar")
    ) {

      cerrarModalEliminar();

    }

  }
);


// =========================================================
// INICIO DEL PANEL
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /*
     * PRIMERO:
     * comprobar sesión.
     */
    configurarPerfil();

    const sesionValida =
      await verificarSesion();


    if (!sesionValida) {
      return;
    }


    /*
     * SEGUNDO:
     * iniciar mantenimiento de sesión.
     */

    iniciarControlSesion();


    /*
     * TERCERO:
     * registrar actividad inmediatamente.
     */

    await mantenerSesion();


    /*
     * CUARTO:
     * cargar información del dashboard.
     */

    if (!redirigiendo) {

      await cargarUsuarios();

    }

  }
);


// =========================================================
// AL ABANDONAR LA PÁGINA
// =========================================================

window.addEventListener(
  "beforeunload",
  () => {

    detenerControlSesion();

  }
);

// =========================================================
// CONFIGURAR PERFIL
// =========================================================

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

    fotoPerfil.src =
      usuario.fotoPerfil;

  }

}

// =========================================================
// CERRAR SESIÓN
// =========================================================

async function cerrarSesion() {

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

