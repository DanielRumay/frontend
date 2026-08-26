// ==========================================
// CREAR DOCUMENTO
// ==========================================

const formulario = document.getElementById("formDocumento");

const nombre = document.getElementById("nombre");
const categoria = document.getElementById("categoria");
const fecha = document.getElementById("fecha");

const archivo = document.getElementById("archivo");

const contadorNombre = document.getElementById("contadorNombre");

const nombreArchivo = document.getElementById("nombreArchivo");

const archivoSeleccionado = document.getElementById("archivoSeleccionado");

const archivoInfo = document.getElementById("archivoInfo");
const btnCancelar = document.getElementById("btnCancelar");
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";
// ==========================================
// FECHA ACTUAL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const hoy = new Date();

  fecha.value = hoy.toISOString().split("T")[0];

});

// ==========================================
// CONTADOR NOMBRE
// ==========================================

nombre.addEventListener("input", () => {

  contadorNombre.textContent =
    `${nombre.value.length} / 100`;

});

// ==========================================
// DOCUMENTO
// ==========================================

archivo.addEventListener("change", () => {

  const file = archivo.files[0];

  if (!file) {

    nombreArchivo.textContent =
      "Ningún documento seleccionado";

    archivoSeleccionado.textContent = "--";

    archivoInfo.textContent =
      "PDF • 0 MB";

    return;

  }

  const extension =
    file.name.split(".").pop().toUpperCase();

  const tamaño =
    (file.size / 1024 / 1024).toFixed(2);

  nombreArchivo.textContent =
    file.name;

  archivoSeleccionado.textContent =
    file.name;

  archivoInfo.textContent =
    `${extension} • ${tamaño} MB`;

});

// ==========================================
// GUARDAR
// ==========================================

formulario.addEventListener("submit", async (e) => {

  e.preventDefault();

  if (nombre.value.trim() === "") {

    alert("Ingrese el nombre del documento.");

    nombre.focus();

    return;

  }

  if (categoria.value === "") {

    alert("Seleccione una categoría.");

    categoria.focus();

    return;

  }

  if (archivo.files.length === 0) {

    alert("Seleccione un documento.");

    return;

  }

  const documento = archivo.files[0];

  const extension =
    documento.name.split(".").pop().toLowerCase();

  const permitidos = ["pdf", "doc", "docx"];

  if (!permitidos.includes(extension)) {

    alert(
      "Solo se permiten archivos PDF, DOC y DOCX."
    );

    return;

  }

  const formData = new FormData();

  formData.append(
    "nombre",
    nombre.value.trim()
  );

  formData.append(
    "categoria",
    categoria.value
  );

  formData.append(
    "fechaPublicacion",
    fecha.value
  );

  formData.append(
    "archivo",
    documento
  );

  try {

    const respuesta = await fetch(
      `${API_URL}/documentos`,
      {

        method: "POST",

        body: formData

      }

    );

    if (!respuesta.ok) {

      throw new Error();

    }

    alert("Documento registrado correctamente.");

    formulario.reset();

    contadorNombre.textContent = "0 / 100";

    nombreArchivo.textContent =
      "Ningún documento seleccionado";

    archivoSeleccionado.textContent = "--";

    archivoInfo.textContent =
      "Formatos permitidos: PDF, DOC y DOCX";

    const hoy = new Date();

    fecha.value = hoy.toISOString().split("T")[0];

  }

  catch (error) {

    console.error(error);

    alert(
      "Ocurrió un error al registrar el documento."
    );

  }

});

btnCancelar.addEventListener("click", () => {

  if(confirm("¿Desea cancelar el registro del documento?")){

    window.location.href = "panel_creacion.html";

  }

});
