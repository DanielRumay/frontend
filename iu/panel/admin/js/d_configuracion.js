// =====================================================
// CONFIGURACIÓN
// =====================================================

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

const LOGIN_URL = "../error.html";

const LOGIN_URL = "../error.html";

const INTERVALO_SESION = 60 * 1000;

let intervaloSesion = null;

let redirigiendo = false;

let usuarioActual = null;


// =====================================================
// ELEMENTOS
// =====================================================

const btnPerfil =
  document.getElementById("btnPerfil");

const profileDropdown =
  document.getElementById("profileDropdown");

const btnLogoutHeader =
  document.getElementById("btnLogoutHeader");

const btnCambiarFoto =
  document.getElementById("btnCambiarFoto");

const btnCambiarFotoTexto =
  document.getElementById("btnCambiarFotoTexto");

const inputFotoPerfil =
  document.getElementById("inputFotoPerfil");


// =====================================================
// ELEMENTOS DE PERFIL
// =====================================================

const fotoPerfil =
  document.getElementById("fotoPerfil");

const imagenPerfil =
  document.getElementById("imagenPerfil");

const imagenPerfilDropdown =
  document.getElementById("imagenPerfilDropdown");

const nombrePerfil =
  document.getElementById("nombrePerfil");

const rolPerfil =
  document.getElementById("rolPerfil");

const nombrePerfilDropdown =
  document.getElementById("nombrePerfilDropdown");

const usuarioPerfilDropdown =
  document.getElementById("usuarioPerfilDropdown");


// =====================================================
// DATOS PERSONALES
// =====================================================

const datoNombres =
  document.getElementById("datoNombres");

const datoApellidos =
  document.getElementById("datoApellidos");

const datoCorreo =
  document.getElementById("datoCorreo");

const datoUsuario =
  document.getElementById("datoUsuario");

const datoRol =
  document.getElementById("datoRol");

const datoEstadoCuenta =
  document.getElementById("datoEstadoCuenta");

const datoFechaRegistro =
  document.getElementById("datoFechaRegistro");


// =====================================================
// INICIO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    cargarUsuario();

    configurarPerfilMenu();

    configurarCambioFoto();

    configurarLogout();

    iniciarControlSesion();

  }
);


// =====================================================
// CAMBIAR FOTO
// =====================================================

function configurarCambioFoto() {

  if (btnCambiarFoto) {

    btnCambiarFoto.addEventListener(
      "click",
      () => {

        inputFotoPerfil?.click();

      }
    );

  }


  if (btnCambiarFotoTexto) {

    btnCambiarFotoTexto.addEventListener(
      "click",
      () => {

        inputFotoPerfil?.click();

      }
    );

  }


  if (inputFotoPerfil) {

    inputFotoPerfil.addEventListener(
      "change",
      manejarCambioFoto
    );

  }

}


// =====================================================
// MANEJAR CAMBIO DE FOTO
// =====================================================

function manejarCambioFoto(event) {

  const archivo =
    event.target.files?.[0];


  if (!archivo) {
    return;
  }


  // =================================================
  // VALIDAR FORMATO
  // =================================================

  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  if (
    !tiposPermitidos.includes(
      archivo.type
    )
  ) {

    mostrarError(
      "Seleccione una imagen JPG, PNG o WEBP."
    );

    event.target.value = "";

    return;

  }


  // =================================================
  // VALIDAR TAMAÑO
  // =================================================

  const maximo =
    5 * 1024 * 1024;


  if (archivo.size > maximo) {

    mostrarError(
      "La imagen no puede superar los 5 MB."
    );

    event.target.value = "";

    return;

  }


  // =================================================
  // PREVISUALIZAR
  // =================================================

  const lector =
    new FileReader();


  lector.onload = () => {

    const foto =
      lector.result;


    actualizarImagen(
      fotoPerfil,
      foto
    );

    actualizarImagen(
      imagenPerfil,
      foto
    );

    actualizarImagen(
      imagenPerfilDropdown,
      foto
    );


    mostrarExito(
      "Foto seleccionada correctamente."
    );

  };


  lector.onerror = () => {

    mostrarError(
      "No se pudo cargar la imagen seleccionada."
    );

  };


  lector.readAsDataURL(
    archivo
  );

}


// =====================================================
// SESIÓN
// =====================================================

function redirigirLogin() {

  if (redirigiendo) {
    return;
  }


  redirigiendo = true;

  detenerControlSesion();


  document.body.style.pointerEvents =
    "none";


  window.location.replace(
    LOGIN_URL
  );

}


// =====================================================
// VERIFICAR SESIÓN
// =====================================================

async function verificarSesion() {

  if (redirigiendo) {
    return false;
  }


  try {

    const respuesta =
      await fetchAutenticado(
        `${API_URL}/usuarios/auth/verificar`,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!respuesta.ok) {

      return false;

    }


    const usuario =
      await respuesta.json();


    if (
      !usuario ||
      usuario.activo !== true
    ) {

      redirigirLogin();

      return false;

    }


    return true;

  }

  catch (error) {

    console.error(
      "Error verificando sesión:",
      error
    );

    return false;

  }

}


// =====================================================
// MANTENER SESIÓN
// =====================================================

async function mantenerSesion() {

  if (redirigiendo) {
    return;
  }


  try {

    const respuesta =
      await fetchAutenticado(
        `${API_URL}/usuarios/actividad`,
        {
          method: "POST",
          cache: "no-store"
        }
      );


    if (respuesta.status === 401) {

      redirigirLogin();

    }

  }

  catch (error) {

    console.error(
      "Error manteniendo sesión:",
      error
    );

  }

}


// =====================================================
// INICIAR CONTROL DE SESIÓN
// =====================================================

function iniciarControlSesion() {

  detenerControlSesion();


  intervaloSesion =
    setInterval(
      mantenerSesion,
      INTERVALO_SESION
    );

}


// =====================================================
// DETENER CONTROL
// =====================================================

function detenerControlSesion() {

  if (intervaloSesion) {

    clearInterval(
      intervaloSesion
    );

    intervaloSesion = null;

  }

}


// =====================================================
// FETCH AUTENTICADO
// =====================================================

async function fetchAutenticado(
  url,
  opciones = {}
) {

  const respuesta =
    await fetch(
      url,
      {
        ...opciones,
        credentials: "include"
      }
    );


  if (respuesta.status === 401) {

    redirigirLogin();

    throw new Error(
      "Sesión expirada."
    );

  }


  return respuesta;

}


// =====================================================
// CARGAR USUARIO
// =====================================================

async function cargarUsuario() {

  try {

    const respuesta =
      await fetchAutenticado(
        `${API_URL}/usuarios/auth/verificar`,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!respuesta.ok) {

      throw new Error(
        "No se pudo obtener la información del usuario."
      );

    }


    usuarioActual =
      await respuesta.json();


    mostrarUsuario(
      usuarioActual
    );

  }

  catch (error) {

    console.error(
      "Error cargando usuario:",
      error
    );


    if (!redirigiendo) {

      mostrarError(
        "No se pudo cargar la información del perfil."
      );

    }

  }

}


// =====================================================
// MOSTRAR USUARIO
// =====================================================

function mostrarUsuario(usuario) {

  if (!usuario) {
    return;
  }


  // =================================================
  // NOMBRE COMPLETO
  // =================================================

  const nombreCompleto =
    `${usuario.nombres || ""} ${usuario.apellidos || ""}`
      .trim();


  const nombreMostrar =
    nombreCompleto || "Usuario";


  // =================================================
  // CABECERA
  // =================================================

  if (nombrePerfil) {

    nombrePerfil.textContent =
      nombreMostrar;

  }


  if (nombrePerfilDropdown) {

    nombrePerfilDropdown.textContent =
      nombreMostrar;

  }


  if (usuarioPerfilDropdown) {

    usuarioPerfilDropdown.textContent =
      usuario.usuario || "-";

  }


  // =================================================
  // ROL
  // =================================================

  const rol =
    convertirRol(
      usuario.rol
    );


  if (rolPerfil) {

    rolPerfil.textContent =
      rol;

  }


  // =================================================
  // DATOS PERSONALES
  // =================================================

  if (datoNombres) {

    datoNombres.textContent =
      usuario.nombres || "-";

  }


  if (datoApellidos) {

    datoApellidos.textContent =
      usuario.apellidos || "-";

  }


  if (datoCorreo) {

    datoCorreo.textContent =
      usuario.correo || "-";

  }


  if (datoUsuario) {

    datoUsuario.textContent =
      usuario.usuario || "-";

  }


  if (datoRol) {

    datoRol.textContent =
      rol;

  }


  // =================================================
  // ESTADO
  // =================================================

  if (datoEstadoCuenta) {

    const activo =
      usuario.activo === true;


    datoEstadoCuenta.textContent =
      activo
        ? "Activo"
        : "Inactivo";


    datoEstadoCuenta.classList.toggle(
      "activo",
      activo
    );


    datoEstadoCuenta.classList.toggle(
      "inactivo",
      !activo
    );

  }


  // =================================================
  // FECHA
  // =================================================

  if (datoFechaRegistro) {

    datoFechaRegistro.textContent =
      formatearFecha(
        usuario.fechaRegistro
      );

  }


  // =================================================
  // FOTO
  // =================================================

  const foto =
    usuario.fotoPerfil &&
    usuario.fotoPerfil.trim() !== ""
      ? usuario.fotoPerfil
      : "../../../multimedia/perfil-default.png";


  actualizarImagen(
    fotoPerfil,
    foto
  );


  actualizarImagen(
    imagenPerfil,
    foto
  );


  actualizarImagen(
    imagenPerfilDropdown,
    foto
  );

}


// =====================================================
// ACTUALIZAR IMAGEN
// =====================================================

function actualizarImagen(
  elemento,
  foto
) {

  if (!elemento) {
    return;
  }


  elemento.src =
    foto;


  elemento.onerror = () => {

    elemento.onerror = null;

    elemento.src =
      "../../../multimedia/perfil-default.png";

  };

}


// =====================================================
// CONVERTIR ROL
// =====================================================

function convertirRol(rol) {

  if (!rol) {

    return "Usuario";

  }


  switch (rol) {

    case "ADMIN":

      return "Administrador";


    case "PERSONAL_ADMINISTRATIVO":

      return "Personal administrativo";


    default:

      return rol;

  }

}


// =====================================================
// FORMATEAR FECHA
// =====================================================

function formatearFecha(fecha) {

  if (!fecha) {

    return "-";

  }


  const fechaObj =
    new Date(fecha);


  if (
    isNaN(
      fechaObj.getTime()
    )
  ) {

    return "-";

  }


  return fechaObj.toLocaleDateString(
    "es-PE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


// =====================================================
// MENÚ DE PERFIL
// =====================================================

function configurarPerfilMenu() {

  if (!btnPerfil || !profileDropdown) {
    return;
  }


  btnPerfil.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      const abierto =
        profileDropdown.classList.toggle(
          "show"
        );


      btnPerfil.setAttribute(
        "aria-expanded",
        abierto
      );

    }
  );


  document.addEventListener(
    "click",
    (event) => {

      if (
        !profileDropdown.contains(
          event.target
        ) &&
        !btnPerfil.contains(
          event.target
        )
      ) {

        profileDropdown.classList.remove(
          "show"
        );


        btnPerfil.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    }
  );

}


// =====================================================
// LOGOUT
// =====================================================

function configurarLogout() {

  if (btnLogoutHeader) {

    btnLogoutHeader.addEventListener(
      "click",
      cerrarSesion
    );

  }

}


// =====================================================
// CERRAR SESIÓN
// =====================================================

async function cerrarSesion() {

  try {

    if (btnLogoutHeader) {

      btnLogoutHeader.disabled =
        true;

    }


    await fetch(
      `${API_URL}/usuarios/logout`,
      {
        method: "POST",
        credentials: "include"
      }
    );

  }

  catch (error) {

    console.error(
      "Error cerrando sesión:",
      error
    );

  }

  finally {

    localStorage.removeItem(
      "usuarioSesion"
    );


    sessionStorage.removeItem(
      "usuarioSesion"
    );


    window.location.href =
      LOGIN_URL;

  }

}


// =====================================================
// MENSAJE ERROR
// =====================================================

function mostrarError(mensaje) {

  const elemento =
    document.getElementById(
      "mensajeError"
    );

  const texto =
    document.getElementById(
      "textoError"
    );


  if (!elemento || !texto) {
    return;
  }


  texto.textContent =
    mensaje;


  elemento.classList.add(
    "show"
  );


  setTimeout(
    () => {

      elemento.classList.remove(
        "show"
      );

    },
    4000
  );

}


// =====================================================
// MENSAJE ÉXITO
// =====================================================

function mostrarExito(mensaje) {

  const elemento =
    document.getElementById(
      "mensajeExito"
    );

  const texto =
    document.getElementById(
      "textoExito"
    );


  if (!elemento || !texto) {
    return;
  }


  texto.textContent =
    mensaje;


  elemento.classList.add(
    "show"
  );


  setTimeout(
    () => {

      elemento.classList.remove(
        "show"
      );

    },
    3500
  );

}


// =====================================================
// DETENER SESIÓN AL SALIR
// =====================================================

window.addEventListener(
  "beforeunload",
  () => {

    detenerControlSesion();

  }
);
