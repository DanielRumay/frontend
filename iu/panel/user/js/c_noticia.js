// ==========================================
// CREAR NOTICIA
// ==========================================

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";
// ------------------------------
// ELEMENTOS
// ------------------------------

const form = document.getElementById("formNoticia");

const titulo = document.getElementById("titulo");
const resumen = document.getElementById("resumen");
const contenido = document.getElementById("contenido");

const categoria = document.getElementById("categoria");
const fecha = document.getElementById("fechaPublicacion");

const imagen = document.getElementById("imagen");
const preview = document.getElementById("previewImagen");
const nombreImagen = document.getElementById("nombreImagen");

const contadorTitulo = document.getElementById("contadorTitulo");
const contadorResumen = document.getElementById("contadorResumen");

const btnCancelar = document.getElementById("btnCancelar");

const urlImagen = document.getElementById("urlImagen");

const contenedorArchivo =
  document.getElementById("contenedorArchivo");

const contenedorURL =
  document.getElementById("contenedorURL");

const radios =
  document.querySelectorAll(
    "input[name='tipoImagen']"
  );

radios.forEach(radio=>{

  radio.addEventListener("change", actualizarTipoImagen);

});

urlImagen.addEventListener("input",()=>{

  preview.src=urlImagen.value;

});

// ==========================================
// FECHA ACTUAL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const hoy = new Date();

  fecha.value = hoy.toISOString().split("T")[0];

});

// ==========================================
// CONTADOR TITULO
// ==========================================

titulo.addEventListener("input", () => {

  contadorTitulo.textContent =
    `${titulo.value.length} / 50`;

});

// ==========================================
// CONTADOR RESUMEN
// ==========================================

resumen.addEventListener("input", () => {

  contadorResumen.textContent =
    `${resumen.value.length} / 100`;

});

// ==========================================
// VISTA PREVIA IMAGEN
// ==========================================

imagen.addEventListener("change", function () {

  const archivo = this.files[0];

  if (!archivo) {

    preview.src = "";

    nombreImagen.textContent =
      "Ningún archivo seleccionado";

    return;

  }

  nombreImagen.textContent =
    archivo.name;

  const lector = new FileReader();

  lector.onload = function (e) {

    preview.src = e.target.result;

  };

  lector.readAsDataURL(archivo);

});

// ==========================================
// CANCELAR
// ==========================================

btnCancelar.addEventListener("click", () => {

  if(confirm("¿Desea cancelar el registro de la noticia?")){

    window.location.href = "panel_creacion.html";

  }

});

// ==========================================
// GUARDAR NOTICIA
// ==========================================

form.addEventListener("submit", async function (e) {

  e.preventDefault();

  if (titulo.value.trim() === "") {
    alert("Ingrese el título.");
    titulo.focus();
    return;
  }

  if (resumen.value.trim() === "") {
    alert("Ingrese el resumen.");
    resumen.focus();
    return;
  }

  if (contenido.value.trim() === "") {
    alert("Ingrese el contenido.");
    contenido.focus();
    return;
  }

  if (categoria.value === "") {
    alert("Seleccione una categoría.");
    categoria.focus();
    return;
  }

  if (fecha.value === "") {
    alert("Seleccione una fecha.");
    fecha.focus();
    return;
  }

  const tipoImagen =
    document.querySelector(
      "input[name='tipoImagen']:checked"
    ).value;

  if(tipoImagen==="archivo"){

    if(imagen.files.length===0){

      alert("Seleccione una imagen.");

      return;

    }

  }

  if(tipoImagen==="url"){

    if(urlImagen.value.trim()===""){

      alert("Ingrese la URL de la imagen.");

      urlImagen.focus();

      return;

    }

  }

  try {

    const formData = new FormData();

    formData.append("titulo", titulo.value.trim());
    formData.append("resumen", resumen.value.trim());
    formData.append("contenido", contenido.value.trim());
    formData.append("categoria", categoria.value);
    formData.append("fechaPublicacion", fecha.value);
    if(tipoImagen==="archivo"){

      formData.append("imagen", imagen.files[0]);

    }else{

      formData.append("urlImagen", urlImagen.value);

    }

    const response = await fetch(
      `${API_URL}/noticias`,
      {
        method: "POST",
        credentials: "include",
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error("Error al registrar la noticia.");
    }

    const noticia = await response.json();

    alert("Noticia registrada correctamente.");

    console.log(noticia);

    form.reset();

    contadorTitulo.textContent = "0 / 50";
    contadorResumen.textContent = "0 / 100";

    preview.src = "";
    nombreImagen.textContent = "Ningún archivo seleccionado";

    fecha.value = new Date().toISOString().split("T")[0];

  } catch (error) {

    console.error(error);

    alert("No fue posible registrar la noticia.");

  }

});

function actualizarTipoImagen(){

  const tipo = document.querySelector(
    "input[name='tipoImagen']:checked"
  ).value;

  if(tipo === "archivo"){

    contenedorArchivo.style.display = "block";
    contenedorURL.style.display = "none";

  }else{

    contenedorArchivo.style.display = "none";
    contenedorURL.style.display = "block";

  }

}

document.addEventListener("DOMContentLoaded", () => {

  const hoy = new Date();

  fecha.value = hoy.toISOString().split("T")[0];

  actualizarTipoImagen();

});
