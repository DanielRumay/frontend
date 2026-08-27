// ==========================================
// MÓDULO DE NOTICIAS
// ==========================================

// ==========================================
// CONFIGURACIÓN API
// ==========================================

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

console.log("📰 MÓDULO DE NOTICIAS");
console.log("🔗 API_URL:", API_URL);


// ==========================================
// VARIABLES
// ==========================================

let noticiasGlobal = [];
let filtroAnio = "";
let filtroMes = "";
let filtroCategoria = "";
let ultimoHashNoticias = "";
let primeraCarga = true;


// ==========================================
// CARGA Y SINCRONIZACIÓN DE NOTICIAS
// ==========================================

async function cargarNoticias() {

  try {

    console.log("📰 Cargando noticias...");

    const response =
      await fetch(`${API_URL}/noticias`);

    if (!response.ok) {

      throw new Error(
        `Error HTTP ${response.status}`
      );

    }

    const noticias =
      await response.json();

    console.log(
      "✅ Noticias recibidas:",
      noticias.length
    );


    const nuevoHash =
      JSON.stringify(
        noticias.map(n => n.id)
      );


    // Solo actualizamos la página
    // si realmente cambiaron las noticias

    if (
      primeraCarga ||
      nuevoHash !== ultimoHashNoticias
    ) {

      primeraCarga = false;

      ultimoHashNoticias =
        nuevoHash;

      noticiasGlobal =
        noticias;


      generarSidebar(
        noticias
      );

      aplicarFiltros();

    }

  } catch (error) {

    console.error(
      "❌ Error al cargar las noticias:",
      error
    );

  }

}


// ==========================================
// INICIAR MÓDULO SOLO SI EXISTE
// ==========================================

if (
  document.getElementById(
    "contenedorNoticias"
  )
) {

  cargarNoticias();

  // Actualizar cada 5 segundos
  setInterval(
    cargarNoticias,
    5000
  );

}


// ==========================================
// RUTA DE IMAGEN
// ==========================================

function obtenerRutaImagen(imagen) {

  if (!imagen) {
    return "";
  }


  if (
    imagen.startsWith("http://") ||
    imagen.startsWith("https://")
  ) {

    return imagen;

  }


  return `${API_URL}${imagen}`;

}


// ==========================================
// GENERACIÓN DE SIDEBAR
// ==========================================

function generarSidebar(datos) {

  generarAnios(datos);

  generarMeses();

  generarCategorias(datos);

}


// ==========================================
// AÑOS
// ==========================================

function generarAnios(datos) {

  const lista =
    document.getElementById(
      "listaAnios"
    );

  if (!lista) return;


  lista.innerHTML = "";


  const anios = [
    ...new Set(

      datos
        .filter(n => n.fechaPublicacion)
        .map(
          n =>
            n.fechaPublicacion
              .substring(0, 4)
        )

    )
  ].sort(
    (a, b) => b - a
  );


  anios.forEach(anio => {

    const li =
      document.createElement("li");

    li.textContent =
      anio;


    li.onclick = () => {

      filtroAnio =
        filtroAnio === anio
          ? ""
          : anio;


      activarItem(
        lista,
        li,
        filtroAnio
      );

      aplicarFiltros();

    };


    lista.appendChild(li);

  });


  const input =
    document.getElementById(
      "buscarAnio"
    );


  if (input) {

    input.oninput = function () {

      const texto =
        this.value.toLowerCase();


      lista
        .querySelectorAll("li")
        .forEach(li => {

          li.style.display =
            li.textContent
              .toLowerCase()
              .includes(texto)
              ? ""
              : "none";

        });

    };

  }

}


// ==========================================
// MESES
// ==========================================

function generarMeses() {

  const lista =
    document.getElementById(
      "listaMeses"
    );

  if (!lista) return;


  lista.innerHTML = "";


  const meses = [

    ["01", "Enero"],
    ["02", "Febrero"],
    ["03", "Marzo"],
    ["04", "Abril"],
    ["05", "Mayo"],
    ["06", "Junio"],
    ["07", "Julio"],
    ["08", "Agosto"],
    ["09", "Septiembre"],
    ["10", "Octubre"],
    ["11", "Noviembre"],
    ["12", "Diciembre"]

  ];


  meses.forEach(
    ([numero, nombre]) => {

      const li =
        document.createElement("li");


      li.textContent =
        nombre;


      li.onclick = () => {

        filtroMes =
          filtroMes === numero
            ? ""
            : numero;


        activarItem(
          lista,
          li,
          filtroMes
        );


        aplicarFiltros();

      };


      lista.appendChild(li);

    }
  );


  const input =
    document.getElementById(
      "buscarMes"
    );


  if (input) {

    input.oninput = function () {

      const texto =
        this.value.toLowerCase();


      lista
        .querySelectorAll("li")
        .forEach(li => {

          li.style.display =
            li.textContent
              .toLowerCase()
              .includes(texto)
              ? ""
              : "none";

        });

    };

  }

}


// ==========================================
// CATEGORÍAS
// ==========================================

function generarCategorias(datos) {

  const lista =
    document.getElementById(
      "listaCategorias"
    );

  if (!lista) return;


  lista.innerHTML = "";


  const categorias = [
    ...new Set(

      datos
        .map(n => n.categoria)
        .filter(Boolean)

    )
  ].sort();


  categorias.forEach(cat => {

    const li =
      document.createElement("li");


    li.textContent =
      cat;


    li.onclick = () => {

      filtroCategoria =
        filtroCategoria === cat
          ? ""
          : cat;


      activarItem(
        lista,
        li,
        filtroCategoria
      );


      aplicarFiltros();

    };


    lista.appendChild(li);

  });


  const input =
    document.getElementById(
      "buscarCategoria"
    );


  if (input) {

    input.oninput = function () {

      const texto =
        this.value.toLowerCase();


      lista
        .querySelectorAll("li")
        .forEach(li => {

          li.style.display =
            li.textContent
              .toLowerCase()
              .includes(texto)
              ? ""
              : "none";

        });

    };

  }

}


// ==========================================
// FILTRADO
// ==========================================

function aplicarFiltros() {

  const inputTitulo =
    document.getElementById(
      "buscarTitulo"
    );


  if (!inputTitulo) return;


  const titulo =
    inputTitulo.value
      .toLowerCase()
      .trim();


  const filtradas =
    noticiasGlobal.filter(
      noticia => {

        const fecha =
          noticia.fechaPublicacion || "";


        const categoria =
          noticia.categoria || "";


        const tituloNoticia =
          noticia.titulo || "";


        const anioOK =
          !filtroAnio ||
          fecha.startsWith(
            filtroAnio
          );


        const mesOK =
          !filtroMes ||
          fecha.split("-")[1] ===
          filtroMes;


        const categoriaOK =
          !filtroCategoria ||
          categoria ===
          filtroCategoria;


        const tituloOK =
          tituloNoticia
            .toLowerCase()
            .includes(titulo);


        return (
          anioOK &&
          mesOK &&
          categoriaOK &&
          tituloOK
        );

      }
    );


  renderizarNoticias(
    filtradas
  );

}


// ==========================================
// RENDERIZAR NOTICIAS
// ==========================================

function renderizarNoticias(
  noticias
) {

  const contenedor =
    document.getElementById(
      "contenedorNoticias"
    );


  if (!contenedor) return;


  contenedor.innerHTML = "";


  if (noticias.length === 0) {

    contenedor.innerHTML = `

      <div class="col-12">

        <p class="text-center">

          No se encontraron noticias.

        </p>

      </div>

    `;

    return;

  }


  noticias.forEach(
    noticia => {

      const imagen =
        obtenerRutaImagen(
          noticia.imagen
        );


      const titulo =
        noticia.titulo || "";


      const resumen =
        noticia.resumen || "";


      const fecha =
        noticia.fechaPublicacion || "";


      contenedor.innerHTML += `

        <div class="col-lg-4 col-md-6 mb-4">

          <div
            class="noticia-card"
            onclick="window.location.href='./detalles-noticias.html?id=${noticia.id}'"
          >

            <img
              src="${imagen}"
              alt="${titulo}"
              class="noticia-img"
            >

            <div class="noticia-content">

              <span class="fecha">
                ${fecha}
              </span>

              <h3>
                ${titulo}
              </h3>

              <p>
                ${resumen}
              </p>

            </div>

          </div>

        </div>

      `;

    }
  );

}


// ==========================================
// ACTIVAR FILTRO
// ==========================================

function activarItem(
  lista,
  item,
  valor
) {

  lista
    .querySelectorAll("li")
    .forEach(
      li =>
        li.classList.remove(
          "active"
        )
    );


  if (valor) {

    item.classList.add(
      "active"
    );

  }

}


// ==========================================
// BUSCADOR POR TÍTULO
// ==========================================

const buscarTitulo =
  document.getElementById(
    "buscarTitulo"
  );


if (buscarTitulo) {

  buscarTitulo.addEventListener(
    "input",
    aplicarFiltros
  );

}


// ==========================================
// DETALLE DE NOTICIA
// ==========================================

async function cargarNoticia() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  const id =
    parametros.get("id");


  if (!id) return;


  try {

    console.log(
      "📰 Cargando noticia ID:",
      id
    );


    const response =
      await fetch(
        `${API_URL}/noticias/${id}`
      );


    if (!response.ok) {

      throw new Error(
        `Error HTTP ${response.status}`
      );

    }


    const noticia =
      await response.json();


    const detalleContenedor =
      document.getElementById(
        "detalleNoticia"
      );


    if (!detalleContenedor) return;


    const imagen =
      obtenerRutaImagen(
        noticia.imagen
      );


    detalleContenedor.innerHTML = `

      <div class="detalle-noticia-card">

        <div class="detalle-noticia-header">

          <span
            class="detalle-noticia-fecha"
          >

            <i
              class="bi bi-calendar-event"
            ></i>

            ${noticia.fechaPublicacion || ""}

          </span>


          <h1
            class="detalle-noticia-titulo"
          >

            ${noticia.titulo || ""}

          </h1>


          <p
            class="detalle-noticia-resumen"
          >

            ${noticia.resumen ?? ""}

          </p>

        </div>


        <div class="detalle-noticia-imagen">

          <img
            src="${imagen}"
            alt="${noticia.titulo || ""}"
          >

        </div>


        <div
          class="detalle-noticia-contenido"
        >

          ${(noticia.contenido || "")
      .replace(/\n/g, "<br>")}

        </div>


        <div
          class="detalle-noticia-footer"
        >

          <a
            href="noticias.html"
            class="detalle-noticia-volver"
          >

            <i
              class="bi bi-arrow-left"
            ></i>

            Volver a Noticias

          </a>

        </div>

      </div>

    `;

  } catch (error) {

    console.error(
      "❌ Error al cargar la noticia:",
      error
    );

  }

}


// ==========================================
// INICIAR DETALLE
// ==========================================

if (
  document.getElementById(
    "detalleNoticia"
  )
) {

  cargarNoticia();

}


// ==========================================
// SIDEBAR DESPLEGABLE
// ==========================================

document
  .querySelectorAll(
    ".sidebar-toggle"
  )
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        btn.parentElement
          .classList
          .toggle("active");

      }
    );

  });


console.log(
  "✅ Módulo de noticias cargado correctamente"
);
