/* ==========================================
   VARIABLES GLOBALES - DOCUMENTOS
========================================== */
let documentosGlobal = [];

let filtroAnioDocumento = "";
let filtroMesDocumento = "";
let filtroCategoria = "";
let filtroTipo = "";

/* ==========================================
   CARGA INICIAL Y API
========================================== */
async function cargarDocumentos() {
  try {
    const response = await fetch("http://localhost:8080/documentos");
    const documentos = await response.json();

    documentosGlobal = documentos;

    generarSidebarDocumentos(documentos);
    renderizarDocumentos(documentos);
  } catch (error) {
    console.error("ERROR EN FETCH DOCUMENTOS:", error);
  }
}

/* ==========================================
   RENDERIZADO DE TABLA Y SIDEBAR
========================================== */
function renderizarDocumentos(documentos) {
  const tbody = document.getElementById("tablaDocumentos");
  if (!tbody) return;

  tbody.innerHTML = "";

  documentos.forEach(doc => {
    let accion = "";

    if (doc.archivo) {

      const texto =
        doc.tipo.toUpperCase() === "PDF"
          ? "Ver PDF"
          : "Descargar";

      accion = `
        <a
            href="http://localhost:8080/documentos/archivo/${doc.archivo}"
            target="_blank"
            class="btn-documento">

            ${texto}

        </a>
    `;

    } else {

      accion = `
        <button
            class="btn-documento btn-disabled"
            disabled>

            No disponible

        </button>
    `;

    }

    tbody.innerHTML += `
      <tr>
        <td>${doc.nombre}</td>
        <td>${doc.categoria}</td>
        <td>${doc.tipo}</td>
        <td>${doc.fechaPublicacion}</td>
        <td>${accion}</td>
      </tr>
    `;
  });
}

function generarSidebarDocumentos(datos) {
  generarAniosDocumentos(datos);
  generarMesesDocumentos(datos);
  generarCategorias(datos);
  generarTipos(datos);
}

function generarAniosDocumentos(datos) {
  const lista = document.getElementById("listaAniosDocumentos");
  if (!lista) return;

  lista.innerHTML = "";
  const anios = [...new Set(datos.map(d => d.fechaPublicacion.substring(0, 4)))]
    .sort((a, b) => b - a);

  anios.forEach(anio => {
    const li = document.createElement("li");
    li.textContent = anio;

    li.onclick = () => {
      filtroAnioDocumento = filtroAnioDocumento === anio ? "" : anio;
      activarItem(lista, li, filtroAnioDocumento);
      aplicarFiltrosDocumentos();
    };

    lista.appendChild(li);
  });

  const input = document.getElementById("buscarAnioDocumento");

  if(input){

    input.oninput = function(){

      const texto = this.value.toLowerCase();

      lista.querySelectorAll("li").forEach(li=>{

        li.style.display =
          li.textContent.toLowerCase().includes(texto)
            ? ""
            : "none";

      });

    };

  }
}

function generarMesesDocumentos(datos) {
  const lista = document.getElementById("listaMesesDocumentos");
  if (!lista) return;

  lista.innerHTML = "";
  const meses = [
    ["01", "Enero"], ["02", "Febrero"], ["03", "Marzo"],
    ["04", "Abril"], ["05", "Mayo"], ["06", "Junio"],
    ["07", "Julio"], ["08", "Agosto"], ["09", "Septiembre"],
    ["10", "Octubre"], ["11", "Noviembre"], ["12", "Diciembre"]
  ];

  const mesesExistentes = [...new Set(datos.map(d => d.fechaPublicacion.split("-")[1]))];

  meses.forEach(([num, nombre]) => {
    if (!mesesExistentes.includes(num)) return;

    const li = document.createElement("li");
    li.textContent = nombre;

    li.addEventListener("click", () => {
      filtroMesDocumento = filtroMesDocumento === num ? "" : num;
      activarItem(lista, li, filtroMesDocumento);
      aplicarFiltrosDocumentos();
    });

    lista.appendChild(li);
  });

  const input = document.getElementById("buscarMesDocumento");

  if(input){

    input.oninput = function(){

      const texto = this.value.toLowerCase();

      lista.querySelectorAll("li").forEach(li=>{

        li.style.display =
          li.textContent.toLowerCase().includes(texto)
            ? ""
            : "none";

      });

    };

  }
}

function generarCategorias(datos){

  const lista = document.getElementById("listaCategoriasDocumentos");

  if(!lista) return;

  lista.innerHTML = "";

  const categorias = [...new Set(datos.map(d => d.categoria))].sort();

  categorias.forEach(categoria => {

    const li = document.createElement("li");

    li.textContent = categoria;

    li.onclick = () => {

      filtroCategoria =
        filtroCategoria === categoria ? "" : categoria;

      activarItem(lista, li, filtroCategoria);

      aplicarFiltrosDocumentos();

    };

    lista.appendChild(li);

  });

  const input = document.getElementById("buscarCategoriaDocumento");

  if(input){

    input.oninput = function(){

      const texto = this.value.toLowerCase();

      lista.querySelectorAll("li").forEach(li=>{

        li.style.display =
          li.textContent.toLowerCase().includes(texto)
            ? ""
            : "none";

      });

    };

  }

}

function generarTipos(datos){

  const lista = document.getElementById("listaTiposDocumentos");

  if(!lista) return;

  lista.innerHTML = "";

  const tipos = [...new Set(datos.map(d => d.tipo))].sort();

  tipos.forEach(tipo => {

    const li = document.createElement("li");

    li.textContent = tipo;

    li.onclick = () => {

      filtroTipo =
        filtroTipo === tipo ? "" : tipo;

      activarItem(lista, li, filtroTipo);

      aplicarFiltrosDocumentos();

    };

    lista.appendChild(li);

  });

  const input = document.getElementById("buscarTipoDocumento");

  if(input){

    input.oninput = function(){

      const texto = this.value.toLowerCase();

      lista.querySelectorAll("li").forEach(li=>{

        li.style.display =
          li.textContent.toLowerCase().includes(texto)
            ? ""
            : "none";

      });

    };

  }

}

function activarItem(lista, item, valor) {
  lista.querySelectorAll("li").forEach(li => li.classList.remove("active"));
  if (valor) {
    item.classList.add("active");
  }
}

/* ==========================================
   LÓGICA DE FILTRADO
========================================== */
function aplicarFiltrosDocumentos() {
  const buscadorDocumento = document.getElementById("buscarDocumento");
  const texto = buscadorDocumento ? buscadorDocumento.value.toLowerCase() : "";

  const filtrados = documentosGlobal.filter(doc => {
    const anioOK = !filtroAnioDocumento || doc.fechaPublicacion.startsWith(filtroAnioDocumento);
    const mesOK = !filtroMesDocumento || doc.fechaPublicacion.split("-")[1] === filtroMesDocumento;
    const categoriaOK = !filtroCategoria || doc.categoria === filtroCategoria;
    const tipoOK = !filtroTipo || doc.tipo === filtroTipo;
    const textoOK = doc.nombre.toLowerCase().includes(texto);

    return anioOK && mesOK && categoriaOK && tipoOK && textoOK;
  });

  renderizarDocumentos(filtrados);
}

/* ==========================================
   INICIALIZACIÓN Y EVENTOS DOM
========================================== */
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tablaDocumentos")) {
    cargarDocumentos();
  }

  const buscadorDocumento = document.getElementById("buscarDocumento");
  if (buscadorDocumento) {
    buscadorDocumento.addEventListener("input", aplicarFiltrosDocumentos);
  }

  // Toggles de la barra lateral (Sidebar)
  document.querySelectorAll(".sidebar-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("active");
    });
  });
});
