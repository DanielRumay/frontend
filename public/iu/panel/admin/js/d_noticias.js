/* =========================================================
   D_NOTICIAS.JS
   GESTIÓN CRUD DE NOTICIAS - MUNI ASCOPE
========================================================= */

const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.protocol === "file:" ||
  window.location.hostname === ""
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

let noticiasGlobal = [];
let noticiaEditarId = null;
let noticiaEliminarId = null;

// ELEMENTOS DOM
const tablaNoticias = document.getElementById("tablaNoticias");
const buscarNoticia = document.getElementById("buscarNoticia");
const filtroCategoria = document.getElementById("filtroCategoria");
const btnCrearNoticia = document.getElementById("btnCrearNoticia");

// MODALES
const modalNoticia = document.getElementById("modalNoticia");
const modalNoticiaTitulo = document.getElementById("modalNoticiaTitulo");
const modalNoticiaSubtitulo = document.getElementById("modalNoticiaSubtitulo");
const btnCerrarModalNoticia = document.getElementById("btnCerrarModalNoticia");
const btnCancelarNoticia = document.getElementById("btnCancelarNoticia");
const formNoticia = document.getElementById("formNoticia");

const modalEliminarNoticia = document.getElementById("modalEliminarNoticia");
const tituloNoticiaEliminar = document.getElementById("tituloNoticiaEliminar");
const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

// CAMPOS FORMULARIO
const inputNoticiaId = document.getElementById("noticiaId");
const inputTitulo = document.getElementById("tituloNoticia");
const selectCategoria = document.getElementById("categoriaNoticia");
const inputFecha = document.getElementById("fechaNoticia");
const textareaResumen = document.getElementById("resumenNoticia");
const textareaContenido = document.getElementById("contenidoNoticia");
const contadorTitulo = document.getElementById("contadorTitulo");
const contadorResumen = document.getElementById("contadorResumen");

// IMAGEN
const radioTipoArchivo = document.querySelector('input[name="tipoImagen"][value="archivo"]');
const radioTipoUrl = document.querySelector('input[name="tipoImagen"][value="url"]');
const contenedorArchivoImagen = document.getElementById("contenedorArchivoImagen");
const contenedorUrlImagen = document.getElementById("contenedorUrlImagen");
const inputArchivoImagen = document.getElementById("archivoImagen");
const inputUrlImagen = document.getElementById("urlImagenNoticia");
const nombreArchivoImagen = document.getElementById("nombreArchivoImagen");
const previewBox = document.getElementById("previewBox");
const previewImagen = document.getElementById("previewImagen");
const btnQuitarImagen = document.getElementById("btnQuitarImagen");

// PERFIL & SESIÓN
const usuarioPerfil = document.getElementById("usuarioPerfil");
const btnPerfilUsuario = document.getElementById("btnPerfilUsuario");
const menuPerfilUsuario = document.getElementById("menuPerfilUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const fotoUsuarioSesion = document.getElementById("fotoUsuarioSesion");
const iconoUsuarioSesion = document.getElementById("iconoUsuarioSesion");
const toastNoticia = document.getElementById("toastNoticia");

/* =========================================================
   INICIALIZACIÓN
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
  cargarNoticias();
  configurarEventos();
});

/* =========================================================
   SESIÓN DEL USUARIO
========================================================= */
async function verificarSesion() {
  try {
    const res = await fetch(`${API_URL}/usuarios/auth/verificar`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) return;
    const usuario = await res.json();
    if (usuario && usuario.fotoPerfil) {
      fotoUsuarioSesion.src = usuario.fotoPerfil;
      fotoUsuarioSesion.style.display = "block";
      if (iconoUsuarioSesion) iconoUsuarioSesion.style.display = "none";
    }
  } catch (err) {
    console.warn("Aviso al verificar sesión:", err);
  }
}

/* =========================================================
   EVENTOS
========================================================= */
function configurarEventos() {
  btnPerfilUsuario?.addEventListener("click", (e) => {
    e.stopPropagation();
    menuPerfilUsuario?.classList.toggle("mostrar");
  });

  document.addEventListener("click", (e) => {
    if (usuarioPerfil && !usuarioPerfil.contains(e.target)) {
      menuPerfilUsuario?.classList.remove("mostrar");
    }
  });

  btnCerrarSesion?.addEventListener("click", async () => {
    try {
      await fetch(`${API_URL}/usuarios/auth/logout`, { method: "POST", credentials: "include" });
    } catch (_) {}
    window.location.href = "../error.html";
  });

  btnCrearNoticia?.addEventListener("click", abrirModalCrear);
  btnCerrarModalNoticia?.addEventListener("click", cerrarModalNoticia);
  btnCancelarNoticia?.addEventListener("click", cerrarModalNoticia);
  btnCancelarEliminar?.addEventListener("click", cerrarModalEliminar);
  btnConfirmarEliminar?.addEventListener("click", confirmarEliminacion);

  buscarNoticia?.addEventListener("input", filtrarNoticias);
  filtroCategoria?.addEventListener("change", filtrarNoticias);

  // Contador de caracteres
  inputTitulo?.addEventListener("input", () => {
    contadorTitulo.textContent = `${inputTitulo.value.length} / 100`;
  });

  textareaResumen?.addEventListener("input", () => {
    contadorResumen.textContent = `${textareaResumen.value.length} / 250`;
  });

  // Selector de imagen (archivo vs URL)
  document.querySelectorAll('input[name="tipoImagen"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "archivo") {
        contenedorArchivoImagen.style.display = "flex";
        contenedorUrlImagen.style.display = "none";
      } else {
        contenedorArchivoImagen.style.display = "none";
        contenedorUrlImagen.style.display = "block";
      }
    });
  });

  inputArchivoImagen?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      nombreArchivoImagen.textContent = file.name;
      const reader = new FileReader();
      reader.onload = (ev) => {
        previewImagen.src = ev.target.result;
        previewBox.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  inputUrlImagen?.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    if (val) {
      previewImagen.src = val;
      previewBox.style.display = "block";
    } else {
      previewBox.style.display = "none";
    }
  });

  btnQuitarImagen?.addEventListener("click", () => {
    inputArchivoImagen.value = "";
    inputUrlImagen.value = "";
    nombreArchivoImagen.textContent = "Ningún archivo seleccionado";
    previewImagen.src = "";
    previewBox.style.display = "none";
  });

  formNoticia?.addEventListener("submit", guardarNoticia);
}

/* =========================================================
   LISTAR NOTICIAS
========================================================= */
async function cargarNoticias() {
  try {
    tablaNoticias.innerHTML = `
      <tr>
        <td colspan="6" class="noticias-cargando">
          <i class="bi bi-arrow-repeat girar"></i> Cargando noticias...
        </td>
      </tr>`;

    const res = await fetch(`${API_URL}/noticias`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const datos = await res.json();
    noticiasGlobal = Array.isArray(datos) ? datos : [];
    renderizarNoticias(noticiasGlobal);

  } catch (error) {
    console.error("Error al cargar noticias:", error);
    tablaNoticias.innerHTML = `
      <tr>
        <td colspan="6" class="noticias-vacio" style="color: var(--rojo);">
          <i class="bi bi-exclamation-triangle-fill"></i> No se pudieron cargar las noticias del servidor.
        </td>
      </tr>`;
  }
}

function filtrarNoticias() {
  const query = (buscarNoticia?.value || "").toLowerCase().trim();
  const cat = filtroCategoria?.value || "";

  const filtradas = noticiasGlobal.filter(n => {
    const matchTitulo = (n.titulo || "").toLowerCase().includes(query);
    const matchResumen = (n.resumen || "").toLowerCase().includes(query);
    const matchCat = (n.categoria || "").toLowerCase().includes(query);
    const matchTexto = matchTitulo || matchResumen || matchCat;
    const matchFiltroCat = !cat || n.categoria === cat;
    return matchTexto && matchFiltroCat;
  });

  renderizarNoticias(filtradas);
}

function renderizarNoticias(lista) {
  if (!lista || lista.length === 0) {
    tablaNoticias.innerHTML = `
      <tr>
        <td colspan="6" class="noticias-vacio">
          <i class="bi bi-inbox" style="font-size: 1.6rem; display: block; margin-bottom: 8px;"></i>
          No se encontraron noticias registradas.
        </td>
      </tr>`;
    return;
  }

  tablaNoticias.innerHTML = lista.map(noticia => {
    const imgUrl = obtenerUrlImagen(noticia.imagen);
    const catClase = obtenerClaseCategoria(noticia.categoria);
    const fecha = formatearFecha(noticia.fechaPublicacion);

    return `
      <tr>
        <td>
          <img src="${imgUrl}" alt="Noticia" class="img-thumb-noticia" onerror="this.src='../../../multimedia/admin1.png'">
        </td>
        <td class="titulo-noticia-cell">
          ${escaparHtml(noticia.titulo || 'Sin título')}
        </td>
        <td>
          <span class="badge-categoria ${catClase}">${escaparHtml(noticia.categoria || 'General')}</span>
        </td>
        <td>${fecha}</td>
        <td class="resumen-noticia-cell" title="${escaparHtml(noticia.resumen || '')}">
          ${escaparHtml(noticia.resumen || '-')}
        </td>
        <td>
          <div class="acciones-cell">
            <button type="button" class="btn-accion editar" title="Editar" onclick="abrirModalEditar('${noticia.id}')">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button type="button" class="btn-accion eliminar" title="Eliminar" onclick="abrirModalEliminar('${noticia.id}', '${escaparHtml(noticia.titulo || '')}')">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function obtenerUrlImagen(img) {
  if (!img) return "../../../multimedia/admin1.png";
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) return img;
  if (img.startsWith("/")) return `${API_URL}${img}`;
  return `${API_URL}/${img}`;
}

function obtenerClaseCategoria(cat) {
  const c = (cat || "").toLowerCase();
  if (c.includes("obra")) return "obras";
  if (c.includes("social")) return "social";
  if (c.includes("educa")) return "educacion";
  if (c.includes("salud")) return "salud";
  if (c.includes("ambiente")) return "ambiente";
  return "";
}

function formatearFecha(f) {
  if (!f) return "-";
  const partes = String(f).split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return f;
}

function escaparHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/* =========================================================
   MODALES CREAR / EDITAR
========================================================= */
function abrirModalCrear() {
  noticiaEditarId = null;
  formNoticia.reset();
  inputNoticiaId.value = "";
  modalNoticiaTitulo.innerHTML = '<i class="bi bi-plus-circle-fill"></i> Crear noticia';
  modalNoticiaSubtitulo.textContent = 'Complete la información requerida de la nueva noticia.';

  // Fecha por defecto hoy
  inputFecha.value = new Date().toISOString().split("T")[0];

  radioTipoArchivo.checked = true;
  contenedorArchivoImagen.style.display = "flex";
  contenedorUrlImagen.style.display = "none";
  nombreArchivoImagen.textContent = "Ningún archivo seleccionado";
  previewImagen.src = "";
  previewBox.style.display = "none";

  contadorTitulo.textContent = "0 / 100";
  contadorResumen.textContent = "0 / 250";

  modalNoticia.classList.add("activo");
}

function abrirModalEditar(id) {
  const noticia = noticiasGlobal.find(n => String(n.id) === String(id));
  if (!noticia) return;

  noticiaEditarId = id;
  inputNoticiaId.value = id;
  modalNoticiaTitulo.innerHTML = '<i class="bi bi-pencil-square"></i> Modificar noticia';
  modalNoticiaSubtitulo.textContent = 'Actualice los datos de la noticia seleccionada.';

  inputTitulo.value = noticia.titulo || "";
  selectCategoria.value = noticia.categoria || "";
  inputFecha.value = noticia.fechaPublicacion || new Date().toISOString().split("T")[0];
  textareaResumen.value = noticia.resumen || "";
  textareaContenido.value = noticia.contenido || "";

  contadorTitulo.textContent = `${inputTitulo.value.length} / 100`;
  contadorResumen.textContent = `${textareaResumen.value.length} / 250`;

  // Imagen existente
  if (noticia.imagen) {
    if (noticia.imagen.startsWith("http://") || noticia.imagen.startsWith("https://")) {
      radioTipoUrl.checked = true;
      contenedorArchivoImagen.style.display = "none";
      contenedorUrlImagen.style.display = "block";
      inputUrlImagen.value = noticia.imagen;
    } else {
      radioTipoArchivo.checked = true;
      contenedorArchivoImagen.style.display = "flex";
      contenedorUrlImagen.style.display = "none";
      nombreArchivoImagen.textContent = "Imagen actual cargada";
    }
    previewImagen.src = obtenerUrlImagen(noticia.imagen);
    previewBox.style.display = "block";
  } else {
    previewBox.style.display = "none";
  }

  modalNoticia.classList.add("activo");
}

function cerrarModalNoticia() {
  modalNoticia.classList.remove("activo");
  formNoticia.reset();
  noticiaEditarId = null;
}

/* =========================================================
   GUARDAR (CREAR / MODIFICAR)
========================================================= */
async function guardarNoticia(e) {
  e.preventDefault();

  const titulo = inputTitulo.value.trim();
  const categoria = selectCategoria.value;
  const fechaPublicacion = inputFecha.value;
  const resumen = textareaResumen.value.trim();
  const contenido = textareaContenido.value.trim();

  if (!titulo || !categoria || !fechaPublicacion || !resumen || !contenido) {
    mostrarToast("Por favor complete todos los campos requeridos.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("categoria", categoria);
  formData.append("fechaPublicacion", fechaPublicacion);
  formData.append("resumen", resumen);
  formData.append("contenido", contenido);

  const esArchivo = radioTipoArchivo.checked;
  const archivo = inputArchivoImagen.files[0];
  const urlImg = inputUrlImagen.value.trim();

  if (esArchivo && archivo) {
    formData.append("imagen", archivo);
  } else if (!esArchivo && urlImg) {
    formData.append("urlImagen", urlImg);
  } else if (!noticiaEditarId) {
    mostrarToast("Debe subir una imagen o ingresar un enlace de imagen.", "error");
    return;
  }

  const btnGuardar = document.getElementById("btnGuardarNoticia");
  btnGuardar.disabled = true;
  btnGuardar.innerHTML = '<i class="bi bi-arrow-repeat girar"></i> Guardando...';

  try {
    let res;
    if (noticiaEditarId) {
      // Intentar PUT primero
      res = await fetch(`${API_URL}/noticias/${noticiaEditarId}`, {
        method: "PUT",
        credentials: "include",
        body: formData
      });

      // Si el backend aún no tiene implementado PUT /noticias/{id} (404/405), fallback a eliminar y re-crear
      if (res.status === 404 || res.status === 405) {
        console.warn("PUT no disponible en backend, aplicando fallback...");
        await fetch(`${API_URL}/noticias/${noticiaEditarId}`, { method: "DELETE", credentials: "include" });
        res = await fetch(`${API_URL}/noticias`, {
          method: "POST",
          credentials: "include",
          body: formData
        });
      }
    } else {
      res = await fetch(`${API_URL}/noticias`, {
        method: "POST",
        credentials: "include",
        body: formData
      });
    }

    if (!res.ok) {
      throw new Error(`Error al guardar noticia: ${res.status}`);
    }

    mostrarToast(noticiaEditarId ? "Noticia modificada correctamente." : "Noticia creada con éxito.", "exito");
    cerrarModalNoticia();
    await cargarNoticias();

  } catch (error) {
    console.error("Error al guardar noticia:", error);
    mostrarToast("Ocurrió un error al guardar la noticia.", "error");
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.innerHTML = '<i class="bi bi-check-circle-fill"></i> Guardar noticia';
  }
}

/* =========================================================
   ELIMINAR
========================================================= */
function abrirModalEliminar(id, titulo) {
  noticiaEliminarId = id;
  tituloNoticiaEliminar.textContent = titulo || "Noticia seleccionada";
  modalEliminarNoticia.classList.add("activo");
}

function cerrarModalEliminar() {
  modalEliminarNoticia.classList.remove("activo");
  noticiaEliminarId = null;
}

async function confirmarEliminacion() {
  if (!noticiaEliminarId) return;

  btnConfirmarEliminar.disabled = true;
  btnConfirmarEliminar.innerHTML = '<i class="bi bi-arrow-repeat girar"></i> Eliminando...';

  try {
    const res = await fetch(`${API_URL}/noticias/${noticiaEliminarId}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (!res.ok && res.status !== 200 && res.status !== 204) {
      throw new Error(`Error al eliminar: ${res.status}`);
    }

    mostrarToast("Noticia eliminada correctamente.", "exito");
    cerrarModalEliminar();
    await cargarNoticias();

  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    mostrarToast("No se pudo eliminar la noticia.", "error");
  } finally {
    btnConfirmarEliminar.disabled = false;
    btnConfirmarEliminar.innerHTML = '<i class="bi bi-trash3-fill"></i> Eliminar';
  }
}

/* =========================================================
   TOAST
========================================================= */
function mostrarToast(mensaje, tipo = "info") {
  if (!toastNoticia) return;
  toastNoticia.textContent = mensaje;
  toastNoticia.className = `toast-notificacion ${tipo} mostrar`;
  setTimeout(() => {
    toastNoticia.classList.remove("mostrar");
  }, 3500);
}
