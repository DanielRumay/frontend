/* =========================================================
   D_DOCUMENTOS.JS
   GESTIÓN DE DOCUMENTOS
========================================================= */
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

let documentosGlobal = [];
let documentoEditarId = null;

/* =========================================================
   SESIÓN DEL USUARIO
========================================================= */

let usuarioSesion = null;

/* =========================================================
   ELEMENTOS
========================================================= */

const tablaDocumentos =
  document.getElementById("tablaDocumentos");

const buscarDocumento =
  document.getElementById("buscarDocumento");

const filtroCategoria =
  document.getElementById("filtroCategoria");

const btnCrearDocumento =
  document.getElementById("btnCrearDocumento");


/* =========================================================
   MODALES
========================================================= */

const modalCrearDocumento =
  document.getElementById("modalCrearDocumento");

const modalEditarDocumento =
  document.getElementById("modalEditarDocumento");

const modalEliminarDocumento =
  document.getElementById("modalEliminarDocumento");


/* =========================================================
   FORMULARIOS
========================================================= */

const formCrearDocumento =
  document.getElementById("formCrearDocumento");

const formEditarDocumento =
  document.getElementById("formEditarDocumento");

/* =========================================================
   PERFIL DEL USUARIO / SESIÓN
========================================================= */

const usuarioPerfil =
  document.getElementById("usuarioPerfil");

const btnPerfilUsuario =
  document.getElementById("btnPerfilUsuario");

const menuPerfilUsuario =
  document.getElementById("menuPerfilUsuario");

const btnCerrarSesion =
  document.getElementById("btnCerrarSesion");

const fotoUsuarioSesion =
  document.getElementById("fotoUsuarioSesion");

const iconoUsuarioSesion =
  document.getElementById("iconoUsuarioSesion");


/* =========================================================
   CARGAR PERFIL DEL USUARIO
========================================================= */

async function cargarPerfilUsuario() {

  try {

    console.log("Verificando sesión del usuario...");


    const response = await fetch(
      `${API_URL}/usuarios/auth/verificar`,
      {
        method: "GET",
        credentials: "include"
      }
    );


    if (!response.ok) {

      console.warn(
        "No existe una sesión activa."
      );

      alert(
        "Su sesión ha expirado o no ha iniciado sesión."
      );

      window.location.href = "login.html";

      return;

    }


    const datosSesion =
      await response.json();

    console.log(
      "Sesión verificada:",
      datosSesion
    );


    /*
       El endpoint /auth/verificar devuelve:
       {
         autenticado: true,
         usuario: "...",
         rol: "..."
       }

       Por eso tomamos directamente
       el usuario desde la sesión del backend.
    */

    const nombreUsuario =
      datosSesion.usuario;


    if (!nombreUsuario) {

      console.warn(
        "La sesión no contiene usuario."
      );

      alert(
        "No se pudo identificar al usuario de la sesión."
      );

      return;

    }


    /*
       Obtener información completa del usuario
       para obtener fotoPerfil.
    */

    const usuariosResponse =
      await fetch(
        `${API_URL}/usuarios`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        }
      );


    if (!usuariosResponse.ok) {

      throw new Error(
        "No se pudo obtener la información del usuario."
      );

    }


    const usuarios =
      await usuariosResponse.json();


    const usuarioActual =
      usuarios.find(
        usuario =>
          usuario.usuario === nombreUsuario
      );


    if (!usuarioActual) {

      console.warn(
        "No se encontró el usuario:",
        nombreUsuario
      );

      alert(
        "No se encontró la información del usuario autenticado."
      );

      return;

    }


    console.log(
      "Usuario actual:",
      usuarioActual
    );


    /* =====================================================
       FOTO DE PERFIL
    ===================================================== */

    if (
      usuarioActual.fotoPerfil &&
      String(usuarioActual.fotoPerfil).trim() !== ""
    ) {

      fotoUsuarioSesion.src =
        usuarioActual.fotoPerfil;

      fotoUsuarioSesion.style.display =
        "block";

      iconoUsuarioSesion.style.display =
        "none";


      fotoUsuarioSesion.onerror = () => {

        console.warn(
          "No se pudo cargar la foto de perfil."
        );

        fotoUsuarioSesion.style.display =
          "none";

        iconoUsuarioSesion.style.display =
          "flex";

      };

    } else {

      /*
         No tiene foto:
         mostrar icono por defecto.
      */

      fotoUsuarioSesion.style.display =
        "none";

      iconoUsuarioSesion.style.display =
        "flex";

    }

  } catch (error) {

    console.error(
      "Error cargando perfil:",
      error
    );

  }

}


/* =========================================================
   ABRIR / CERRAR MENÚ DE PERFIL
========================================================= */

if (btnPerfilUsuario) {

  btnPerfilUsuario.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      menuPerfilUsuario.classList.toggle(
        "mostrar"
      );

    }
  );

}


/* =========================================================
   CERRAR MENÚ AL HACER CLICK AFUERA
========================================================= */

document.addEventListener(
  "click",
  (event) => {

    if (
      usuarioPerfil &&
      !usuarioPerfil.contains(event.target)
    ) {

      menuPerfilUsuario.classList.remove(
        "mostrar"
      );

    }

  }
);


/* =========================================================
   CERRAR SESIÓN
========================================================= */

if (btnCerrarSesion) {

  btnCerrarSesion.addEventListener(
    "click",
    async () => {

      try {

        btnCerrarSesion.disabled = true;


        const response = await fetch(
          `${API_URL}/usuarios/logout`,
          {
            method: "POST",
            credentials: "include"
          }
        );


        if (!response.ok) {

          throw new Error(
            `Error al cerrar sesión: HTTP ${response.status}`
          );

        }

        sessionStorage.removeItem("usuario");
        sessionStorage.removeItem("rol");

        localStorage.removeItem("usuario");
        localStorage.removeItem("rol");


        /*
           Redirigir al login.
        */

        window.location.href =
          "login.html";


      } catch (error) {

        console.error(
          "Error cerrando sesión:",
          error
        );

        btnCerrarSesion.disabled = false;

        alert(
          "No se pudo cerrar la sesión. Intente nuevamente."
        );

      }

    }
  );

}

/* =========================================================
   CARGAR DOCUMENTOS
========================================================= */

async function cargarDocumentos() {

  try {

    console.log("Cargando documentos...");

    const response = await fetch(
      `${API_URL}/documentos`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      }
    );


    console.log(
      "Estado documentos:",
      response.status
    );


    if (!response.ok) {

      throw new Error(
        `Error HTTP ${response.status}`
      );

    }


    const datos =
      await response.json();


    if (!Array.isArray(datos)) {

      throw new Error(
        "La respuesta de /documentos no es una lista."
      );

    }


    console.log(
      "Documentos recibidos:",
      datos
    );


    documentosGlobal = datos;


    prepararFiltroCategorias();

    renderizarDocumentos();


  } catch (error) {

    console.error(
      "Error cargando documentos:",
      error
    );


    if (tablaDocumentos) {

      tablaDocumentos.innerHTML = `
                <tr>
                    <td colspan="7" class="documentos-error">

                        <i class="bi bi-exclamation-circle"></i>

                        <div>
                            No se pudieron cargar los documentos.
                        </div>

                    </td>
                </tr>
            `;

    }

  }

}


/* =========================================================
   FILTRO CATEGORÍAS
========================================================= */

function prepararFiltroCategorias() {

  if (!filtroCategoria) return;


  const valorActual =
    filtroCategoria.value;


  const categorias = [
    ...new Set(
      documentosGlobal
        .map(documento => documento.categoria)
        .filter(categoria =>
          categoria !== null &&
          categoria !== undefined &&
          String(categoria).trim() !== ""
        )
    )
  ];


  filtroCategoria.innerHTML = `
        <option value="">
            Todas las categorías
        </option>
    `;


  categorias
    .sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "es"
      )
    )
    .forEach(categoria => {

      const option =
        document.createElement("option");

      option.value = categoria;

      option.textContent = categoria;

      filtroCategoria.appendChild(option);

    });


  if (categorias.includes(valorActual)) {

    filtroCategoria.value =
      valorActual;

  }

}


/* =========================================================
   RENDERIZAR DOCUMENTOS
========================================================= */

function renderizarDocumentos() {

  if (!tablaDocumentos) {

    console.warn(
      "No existe #tablaDocumentos"
    );

    return;

  }


  const texto =
    buscarDocumento
      ? buscarDocumento.value
        .toLowerCase()
        .trim()
      : "";


  const categoriaSeleccionada =
    filtroCategoria
      ? filtroCategoria.value
      : "";


  const registros =
    documentosGlobal.filter(documento => {


      const nombre =
        String(
          documento.nombre || ""
        ).toLowerCase();


      const categoria =
        String(
          documento.categoria || ""
        ).toLowerCase();


      const coincideBusqueda =
        !texto ||
        nombre.includes(texto) ||
        categoria.includes(texto);


      const coincideCategoria =
        !categoriaSeleccionada ||
        documento.categoria === categoriaSeleccionada;


      return (
        coincideBusqueda &&
        coincideCategoria
      );

    });


  /* =====================================================
     SIN REGISTROS
  ===================================================== */

  if (registros.length === 0) {

    tablaDocumentos.innerHTML = `
            <tr>
                <td colspan="7" class="documentos-sin-registros">

                    <i class="bi bi-file-earmark-x"></i>

                    <div>
                        No hay documentos registrados.
                    </div>

                </td>
            </tr>
        `;

    return;

  }


  /* =====================================================
     FILAS
  ===================================================== */

  tablaDocumentos.innerHTML =
    registros.map((documento, index) => {

      // ID que se muestra visualmente en la tabla
      const idVisual =
        index + 1;

      // ID real enviado por MongoDB
      const idReal =
        documento.id || "";


      const nombre =
        documento.nombre || "-";


      const categoria =
        documento.categoria || "-";


      const tipo =
        documento.tipo || "-";


      const fecha =
        formatearFecha(
          documento.fechaPublicacion
        );


      const archivo =
        documento.archivo || "";


      return `
                <tr>

                    <!-- ID -->

                    <td>
    <span class="documento-id">
        ${idVisual}
    </span>
</td>


                    <!-- NOMBRE -->

                    <td>

                        <div class="documento-nombre">

                            <div class="documento-icono">

                                <i class="${obtenerIconoTipo(tipo)}"></i>

                            </div>

                            <span>
                                ${escapeHTML(nombre)}
                            </span>

                        </div>

                    </td>


                    <!-- CATEGORÍA -->

                    <td>

                        <span class="documento-categoria">

                            ${escapeHTML(categoria)}

                        </span>

                    </td>


                    <!-- TIPO -->

                    <td>

                        <span class="documento-tipo">

                            ${escapeHTML(tipo)}

                        </span>

                    </td>


                    <!-- FECHA -->

                    <td>

                        ${fecha}

                    </td>


                    <!-- ARCHIVO -->

                    <td>

                        ${
        archivo
          ?
          `
                            <button
                                type="button"
                                class="documento-btn-archivo"
                                onclick="abrirDocumento('${escapeAtributo(archivo)}')"
                                title="Ver documento">

                                <i class="bi bi-file-earmark-arrow-down-fill"></i>

                                Ver archivo

                            </button>
                            `
          :
          `
                            <span class="documento-sin-archivo">
                                Sin archivo
                            </span>
                            `
      }

                    </td>


                    <!-- ACCIONES -->

                    <td>

                        <div class="documentos-acciones">

                            <button
                                type="button"
                                class="documento-btn-accion documento-btn-editar"
                                onclick="abrirEditarDocumento('${escapeAtributo(idReal)}')"
                                title="Editar">

                                <i class="bi bi-pencil-fill"></i>

                            </button>


                            <button
                                type="button"
                                class="documento-btn-accion documento-btn-eliminar"
                                onclick="abrirEliminarDocumento('${escapeAtributo(idReal)}')"
                                title="Eliminar">

                                <i class="bi bi-trash-fill"></i>

                            </button>

                        </div>

                    </td>

                </tr>
            `;

    }).join("");

}


/* =========================================================
   CREAR DOCUMENTO
========================================================= */

async function crearDocumento(event) {

  event.preventDefault();


  try {

    const nombre =
      document.getElementById(
        "crearNombre"
      ).value.trim();


    const categoria =
      document.getElementById(
        "crearCategoria"
      ).value.trim();


    const tipo =
      document.getElementById(
        "crearTipo"
      ).value.trim();


    const fechaPublicacion =
      document.getElementById(
        "crearFechaPublicacion"
      ).value;


    const archivoInput =
      document.getElementById(
        "crearArchivo"
      );


    if (!nombre) {

      alert("Ingrese el nombre del documento.");
      return;

    }


    if (!categoria) {

      alert("Ingrese la categoría.");
      return;

    }


    if (!archivoInput.files.length) {

      alert("Debe seleccionar un archivo.");
      return;

    }


    const archivo =
      archivoInput.files[0];


    if (!archivoValido(archivo)) {

      alert(
        "Solo se permiten archivos PDF, DOC o DOCX."
      );

      return;

    }


    const formData =
      new FormData();


    formData.append(
      "nombre",
      nombre
    );


    formData.append(
      "categoria",
      categoria
    );


    formData.append(
      "tipo",
      tipo || obtenerTipoArchivo(archivo)
    );


    formData.append(
      "fechaPublicacion",
      fechaPublicacion
    );


    formData.append(
      "archivo",
      archivo
    );


    const response =
      await fetch(
        `${API_URL}/documentos`,
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );


    if (!response.ok) {

      throw new Error(
        `Error HTTP ${response.status}`
      );

    }


    cerrarModal(
      modalCrearDocumento
    );


    formCrearDocumento.reset();


    await cargarDocumentos();


    alert(
      "Documento registrado correctamente."
    );


  } catch (error) {

    console.error(
      "Error creando documento:",
      error
    );


    alert(
      "No se pudo registrar el documento."
    );

  }

}


/* =========================================================
   ABRIR EDITAR
========================================================= */

function abrirEditarDocumento(id) {

  const documento =
    documentosGlobal.find(
      item => String(item.id) === String(id)
    );


  if (!documento) {

    alert(
      "No se encontró el documento."
    );

    return;

  }


  documentoEditarId =
    documento.id;


  document.getElementById(
    "editarDocumentoId"
  ).value =
    documento.id || "";


  document.getElementById(
    "editarNombre"
  ).value =
    documento.nombre || "";


  document.getElementById(
    "editarCategoria"
  ).value =
    documento.categoria || "";


  document.getElementById(
    "editarTipo"
  ).value =
    documento.tipo || "";


  document.getElementById(
    "editarFechaPublicacion"
  ).value =
    documento.fechaPublicacion || "";


  const archivoActual =
    document.getElementById(
      "archivoActualNombre"
    );

  if (archivoActual) {

    if (documento.archivo) {

      archivoActual.textContent =
        obtenerNombreArchivo(
          documento.archivo
        );

    } else {

      archivoActual.textContent =
        "Sin archivo";

    }
  }

  const nuevoArchivo =
    document.getElementById(
      "editarArchivo"
    );


  if (nuevoArchivo) {

    nuevoArchivo.value = "";

  }


  abrirModal(
    modalEditarDocumento
  );

}


/* =========================================================
   MODIFICAR DOCUMENTO
========================================================= */

async function modificarDocumento(event) {

  event.preventDefault();


  if (!documentoEditarId) {

    alert(
      "No se ha seleccionado ningún documento."
    );

    return;

  }


  try {

    const nombre =
      document.getElementById(
        "editarNombre"
      ).value.trim();


    const categoria =
      document.getElementById(
        "editarCategoria"
      ).value.trim();


    const tipo =
      document.getElementById(
        "editarTipo"
      ).value.trim();


    const fechaPublicacion =
      document.getElementById(
        "editarFechaPublicacion"
      ).value;


    const archivoInput =
      document.getElementById(
        "editarArchivo"
      );


    /* =================================================
       FORM DATA
    ================================================= */

    const formData =
      new FormData();


    formData.append(
      "nombre",
      nombre
    );


    formData.append(
      "categoria",
      categoria
    );


    formData.append(
      "tipo",
      tipo
    );


    formData.append(
      "fechaPublicacion",
      fechaPublicacion
    );


    /*
     * IMPORTANTE:
     *
     * Si el usuario NO selecciona un archivo nuevo,
     * no enviamos "archivo".
     *
     * Si selecciona uno nuevo,
     * el backend debe reemplazar el archivo anterior.
     */

    if (
      archivoInput &&
      archivoInput.files.length > 0
    ) {

      const nuevoArchivo =
        archivoInput.files[0];


      if (!archivoValido(nuevoArchivo)) {

        alert(
          "Solo se permiten archivos PDF, DOC o DOCX."
        );

        return;

      }


      formData.append(
        "archivo",
        nuevoArchivo
      );

    }


    const response =
      await fetch(
        `${API_URL}/documentos/${encodeURIComponent(documentoEditarId)}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData
        }
      );


    if (!response.ok) {

      throw new Error(
        `Error HTTP ${response.status}`
      );

    }


    cerrarModal(
      modalEditarDocumento
    );


    documentoEditarId =
      null;


    await cargarDocumentos();


    alert(
      "Documento modificado correctamente."
    );


  } catch (error) {

    console.error(
      "Error modificando documento:",
      error
    );


    alert(
      "No se pudo modificar el documento."
    );

  }

}


/* =========================================================
   ABRIR ELIMINAR
========================================================= */

let documentoEliminarId = null;


function abrirEliminarDocumento(id) {

  const documento =
    documentosGlobal.find(
      item => String(item.id) === String(id)
    );


  if (!documento) return;


  documentoEliminarId =
    documento.id;


  const nombreElemento =
    document.getElementById(
      "nombreDocumentoEliminar"
    );


  if (nombreElemento) {

    nombreElemento.textContent =
      documento.nombre || "Documento";

  }


  abrirModal(
    modalEliminarDocumento
  );

}


/* =========================================================
   CONFIRMAR ELIMINAR
========================================================= */

async function eliminarDocumento() {

  if (!documentoEliminarId) {

    return;

  }


  try {

    const response =
      await fetch(
        `${API_URL}/documentos/${encodeURIComponent(documentoEliminarId)}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );


    if (!response.ok) {

      throw new Error(
        `Error HTTP ${response.status}`
      );

    }


    cerrarModal(
      modalEliminarDocumento
    );


    documentoEliminarId =
      null;


    await cargarDocumentos();


    alert(
      "Documento eliminado correctamente."
    );


  } catch (error) {

    console.error(
      "Error eliminando documento:",
      error
    );


    alert(
      "No se pudo eliminar el documento."
    );

  }

}


/* =========================================================
   ABRIR ARCHIVO
========================================================= */

function abrirDocumento(archivo) {

  if (!archivo) {

    alert(
      "Este documento no tiene un archivo asociado."
    );

    return;
  }

  const url =
    `${API_URL}/documentos/archivo/${encodeURIComponent(archivo)}`;

  window.open(url, "_blank");
}


/* =========================================================
   VALIDAR ARCHIVO
========================================================= */

function archivoValido(archivo) {

  if (!archivo) {

    return false;

  }


  const nombre =
    archivo.name.toLowerCase();


  return (
    nombre.endsWith(".pdf") ||
    nombre.endsWith(".doc") ||
    nombre.endsWith(".docx")
  );

}


/* =========================================================
   OBTENER TIPO
========================================================= */

function obtenerTipoArchivo(archivo) {

  if (!archivo) return "";


  const nombre =
    archivo.name.toLowerCase();


  if (nombre.endsWith(".pdf")) {

    return "PDF";

  }


  if (nombre.endsWith(".docx")) {

    return "DOCX";

  }


  if (nombre.endsWith(".doc")) {

    return "DOC";

  }


  return "";

}


/* =========================================================
   OBTENER NOMBRE DEL ARCHIVO
========================================================= */

function obtenerNombreArchivo(archivo) {

  if (!archivo) return "";


  const partes =
    String(archivo).split("/");


  return partes[
  partes.length - 1
    ];

}


/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatearFecha(fecha) {

  if (!fecha) {

    return "-";

  }


  const partes =
    String(fecha).split("-");


  if (partes.length !== 3) {

    return fecha;

  }


  return `
        ${partes[2]}/${partes[1]}/${partes[0]}
    `;

}


/* =========================================================
   ICONO SEGÚN TIPO
========================================================= */

function obtenerIconoTipo(tipo) {

  const valor =
    String(tipo || "").toUpperCase();


  if (valor === "PDF") {

    return "bi bi-file-earmark-pdf-fill";

  }


  if (
    valor === "DOC" ||
    valor === "DOCX"
  ) {

    return "bi bi-file-earmark-word-fill";

  }


  return "bi bi-file-earmark-text-fill";

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(valor) {

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   ESCAPAR ATRIBUTOS
========================================================= */

function escapeAtributo(valor) {

  return String(valor)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;");

}


/* =========================================================
   MODALES
========================================================= */

function abrirModal(modal) {

  if (!modal) return;

  modal.classList.add(
    "mostrar"
  );

  document.body.style.overflow =
    "hidden";

}


function cerrarModal(modal) {

  if (!modal) return;

  modal.classList.remove(
    "mostrar"
  );

  document.body.style.overflow =
    "";

}


/* =========================================================
   CREAR
========================================================= */

if (btnCrearDocumento) {

  btnCrearDocumento.addEventListener(
    "click",
    () => {

      abrirModal(
        modalCrearDocumento
      );

    }
  );

}


/* =========================================================
   FORM CREAR
========================================================= */

if (formCrearDocumento) {

  formCrearDocumento.addEventListener(
    "submit",
    crearDocumento
  );

}


/* =========================================================
   FORM EDITAR
========================================================= */

if (formEditarDocumento) {

  formEditarDocumento.addEventListener(
    "submit",
    modificarDocumento
  );

}


/* =========================================================
   BUSCADOR
========================================================= */

if (buscarDocumento) {

  buscarDocumento.addEventListener(
    "input",
    renderizarDocumentos
  );

}


/* =========================================================
   FILTRO CATEGORÍA
========================================================= */

if (filtroCategoria) {

  filtroCategoria.addEventListener(
    "change",
    renderizarDocumentos
  );

}


/* =========================================================
   BOTONES CERRAR
========================================================= */

document
  .getElementById("cerrarCrearDocumento")
  ?.addEventListener(
    "click",
    () => cerrarModal(
      modalCrearDocumento
    )
  );


document
  .getElementById("cancelarCrearDocumento")
  ?.addEventListener(
    "click",
    () => cerrarModal(
      modalCrearDocumento
    )
  );


document
  .getElementById("cerrarEditarDocumento")
  ?.addEventListener(
    "click",
    () => cerrarModal(
      modalEditarDocumento
    )
  );


document
  .getElementById("cancelarEditarDocumento")
  ?.addEventListener(
    "click",
    () => cerrarModal(
      modalEditarDocumento
    )
  );


document
  .getElementById("cancelarEliminarDocumento")
  ?.addEventListener(
    "click",
    () => cerrarModal(
      modalEliminarDocumento
    )
  );


/* =========================================================
   CONFIRMAR ELIMINAR
========================================================= */

document
  .getElementById("confirmarEliminarDocumento")
  ?.addEventListener(
    "click",
    eliminarDocumento
  );


/* =========================================================
   CERRAR MODAL HACIENDO CLICK AFUERA
========================================================= */

[
  modalCrearDocumento,
  modalEditarDocumento,
  modalEliminarDocumento
].forEach(modal => {

  if (!modal) return;


  modal.addEventListener(
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

document
  .getElementById("btnVerArchivoActual")
  ?.addEventListener("click", () => {

    if (!documentoEditarId) return;

    const documento =
      documentosGlobal.find(
        item =>
          String(item.id) ===
          String(documentoEditarId)
      );

    if (!documento || !documento.archivo) {

      alert(
        "Este documento no tiene un archivo asociado."
      );

      return;
    }

    abrirDocumento(documento.archivo);

  });


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await cargarPerfilUsuario();

    await cargarDocumentos();

  }
);


/* =========================================================
   FUNCIONES GLOBALES
========================================================= */

window.abrirEditarDocumento =
  abrirEditarDocumento;

window.abrirEliminarDocumento =
  abrirEliminarDocumento;

window.abrirDocumento =
  abrirDocumento;

/* =========================================================
   COMPROBAR SESIÓN
========================================================= */

async function comprobarSesion() {

  try {

    const response = await fetch(
      `${API_URL}/auth/me`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      }
    );


    if (!response.ok) {

      redirigirLogin();

      return false;

    }


    const usuario =
      await response.json();


    usuarioSesion =
      usuario;


    return true;


  } catch (error) {

    console.error(
      "Error comprobando sesión:",
      error
    );


    redirigirLogin();

    return false;

  }

}

/* =========================================================
   REDIRIGIR AL LOGIN
========================================================= */

function redirigirLogin() {

  window.location.href =
    "../error.html";

}

/* =========================================================
   CERRAR SESIÓN
========================================================= */

async function cerrarSesion() {

  try {

    const response =
      await fetch(
        `${API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        }
      );


    /*
     * Aunque el backend responda con error,
     * limpiamos la sesión del frontend y
     * mandamos al login.
     */

    if (!response.ok) {

      console.warn(
        "El servidor respondió:",
        response.status
      );

    }


  } catch (error) {

    console.error(
      "Error cerrando sesión:",
      error
    );

  } finally {

    redirigirLogin();

  }

}

/* =========================================================
   PERFIL / MENÚ
========================================================= */

const btnPerfil =
  document.getElementById(
    "btnPerfil"
  );

const menuPerfil =
  document.getElementById(
    "menuPerfil"
  );


/* =========================================================
   ABRIR / CERRAR MENÚ
========================================================= */

if (btnPerfil) {

  btnPerfil.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      if (menuPerfil) {

        menuPerfil.classList.toggle(
          "visible"
        );

      }

    }
  );

}


/* =========================================================
   CERRAR MENU AL HACER CLICK AFUERA
========================================================= */

/* =========================================================
   CERRAR MENÚ AL HACER CLICK AFUERA
========================================================= */

document.addEventListener(
  "click",
  event => {

    if (
      menuPerfil &&
      !menuPerfil.contains(event.target) &&
      !btnPerfil?.contains(event.target)
    ) {

      menuPerfil.classList.remove(
        "visible"
      );

    }

  }
);


/* =========================================================
   BOTÓN CERRAR SESIÓN
========================================================= */

if (btnCerrarSesion) {

  btnCerrarSesion.addEventListener(
    "click",
    cerrarSesion
  );

}
