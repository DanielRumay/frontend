/* =========================================================
   CONFIG
========================================================= */

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

let graficoRegistros = null;
let graficoVisitasLugar = null;
let graficoDocumentos = null;
let graficoActividades = null;

/* Datos actualmente cargados */
let datosEstadisticasActuales = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const filtroAnio = document.getElementById("filtroAnio");
const filtroPeriodo = document.getElementById("filtroPeriodo");
const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");

const btnDescargarCSV = document.getElementById("btnDescargarCSV");
const btnDescargarPDF = document.getElementById("btnDescargarPDF");

const estadoCarga = document.getElementById("estadoCarga");
const mensajeError = document.getElementById("mensajeError");

/* =========================================================
   CONST DE CERRAR SESION
=========================================================*/

const btnPerfil =
  document.getElementById("btnPerfil");

const profileDropdown =
  document.getElementById("profileDropdown");

const btnLogoutHeader =
  document.getElementById("btnLogoutHeader");

const modalLogout =
  document.getElementById("modalLogout");

const btnCancelarLogout =
  document.getElementById("btnCancelarLogout");

const btnConfirmarLogout =
  document.getElementById("btnConfirmarLogout");

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  inicializarAnios();

  filtroAnio.value = String(new Date().getFullYear());

  btnAplicarFiltros.addEventListener(
    "click",
    cargarEstadisticas
  );

  btnDescargarCSV?.addEventListener(
    "click",
    descargarCSV
  );

  btnDescargarPDF?.addEventListener(
    "click",
    descargarPDF
  );

  cargarEstadisticas();

  configurarPerfilMenu();

  configurarLogout();

});


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



}

// =====================================================
// LOGOUT
// =====================================================

function configurarLogout() {

  if (btnLogoutHeader) {

    btnLogoutHeader.addEventListener(
      "click",
      () => {

        if (profileDropdown) {

          profileDropdown.classList.remove(
            "show"
          );

        }


        if (btnPerfil) {

          btnPerfil.setAttribute(
            "aria-expanded",
            "false"
          );

        }


        abrirModalLogout();

      }
    );

  }


  if (btnCancelarLogout) {

    btnCancelarLogout.addEventListener(
      "click",
      cerrarModalLogout
    );

  }


  if (btnConfirmarLogout) {

    btnConfirmarLogout.addEventListener(
      "click",
      cerrarSesion
    );

  }

}

// =====================================================
// ABRIR MODAL
// =====================================================

function abrirModalLogout() {

  if (!modalLogout) {
    return;
  }


  modalLogout.style.display =
    "flex";

}

// =====================================================
// CERRAR MODAL
// =====================================================

function cerrarModalLogout() {

  if (!modalLogout) {
    return;
  }


  modalLogout.style.display =
    "none";

}

// =====================================================
// CERRAR SESIÓN
// =====================================================

async function cerrarSesion() {

  try {

    if (btnConfirmarLogout) {

      btnConfirmarLogout.disabled =
        true;

      btnConfirmarLogout.innerHTML =
        `
          <i class="fa-solid fa-spinner fa-spin"></i>
          Cerrando sesión...
        `;

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


/* =========================================================
   YEARS
========================================================= */

function inicializarAnios() {

  const anioActual = new Date().getFullYear();

  filtroAnio.innerHTML = "";

  for (
    let anio = anioActual;
    anio >= anioActual - 5;
    anio--
  ) {

    const option = document.createElement("option");

    option.value = anio;
    option.textContent = anio;

    filtroAnio.appendChild(option);

  }

}


/* =========================================================
   LOAD
========================================================= */

// Función principal para cargar y renderear las estadísticas
async function cargarEstadisticas(anio = 2026, periodo = 'todo') {
  try {
    console.group(`📊 [DEBUG] Cargando Estadísticas - Año: ${anio}, Periodo: ${periodo}`);

    const response = await fetch(`/api/estadisticas?anio=${anio}&periodo=${periodo}`);

    // Si la respuesta no es OK o no es JSON, imprimimos el HTML que llegó
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      const htmlError = await response.text();
      console.error("❌ El servidor respondió con HTML en lugar de JSON. Código:", response.status);
      console.log("📄 Contenido HTML devuelto por la API:", htmlError);
      console.groupEnd();
      return;
    }

    const data = await response.json();
    console.log("📦 DTO Recibido completo:", data);

    actualizarTarjetasDOM(data);
    renderizarGraficos(data);
    console.groupEnd();

  } catch (error) {
    console.error("❌ Error al cargar estadísticas:", error);
  }
}

// ✅ Opción recomendada: limpia, segura y compatible
function actualizarTarjetasDOM(data) {
  const asignarTexto = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.innerText = valor ?? 0;
  };

  asignarTexto('cardUsuarios', data.usuariosRegistrados);
  asignarTexto('cardVisitas', data.visitasRegistradas);
  asignarTexto('cardAgenda', data.actividadesProgramadas);
  asignarTexto('cardDocumentos', data.documentosPublicados);
  asignarTexto('cardNoticias', data.noticiasPublicadas);
  asignarTexto('cardUsuariosActivos', data.usuariosActivos);
}

// Mapeo detallado de los datasets para Chart.js
function renderizarGraficos(data) {
  // Ejemplo de mapeo con log para Registros Mensuales
  if (data.registrosMensuales) {
    const meses = data.registrosMensuales.map(m => m.nombreMes);
    const visitas = data.registrosMensuales.map(m => m.visitas);
    const documentos = data.registrosMensuales.map(m => m.documentos);
    const noticias = data.registrosMensuales.map(m => m.noticias);
    const actividades = data.registrosMensuales.map(m => m.actividades);

    console.log("🎨 Mapeo 'Registros Mensuales' -> Meses:", meses);
    console.log("🎨 Mapeo 'Registros Mensuales' -> Documentos por mes:", documentos);

    // Aquí invocas o actualizas la instancia de tu Chart.js
    // miGraficoBarra.data.labels = meses;
    // miGraficoBarra.data.datasets[1].data = documentos;
    // miGraficoBarra.update();
  }
}


/* =========================================================
   CARDS
========================================================= */

function actualizarTarjetas(datos) {

  const usuarios =
    Number(datos.usuariosRegistrados || 0);

  const activos =
    Number(datos.usuariosActivos || 0);

  const visitas =
    Number(datos.visitasRegistradas || 0);

  const actividades =
    Number(datos.actividadesProgramadas || 0);

  const documentos =
    Number(datos.documentosPublicados || 0);

  const noticias =
    Number(datos.noticiasPublicadas || 0);


  establecerTexto(
    "usuariosRegistrados",
    formatearNumero(usuarios)
  );

  establecerTexto(
    "usuariosActivos",
    formatearNumero(activos)
  );

  establecerTexto(
    "visitasRegistradas",
    formatearNumero(visitas)
  );

  establecerTexto(
    "actividadesProgramadas",
    formatearNumero(actividades)
  );

  establecerTexto(
    "documentosPublicados",
    formatearNumero(documentos)
  );

  establecerTexto(
    "noticiasPublicadas",
    formatearNumero(noticias)
  );


  let porcentaje = 0;

  if (usuarios > 0) {

    porcentaje =
      (activos / usuarios) * 100;

  }

  establecerTexto(
    "porcentajeUsuariosActivos",
    `${porcentaje.toFixed(1)}% de los usuarios`
  );

}


/* =========================================================
   CHARTS
========================================================= */

function actualizarGraficos(datos) {

  crearGraficoRegistros(
    datos.registrosMensuales || []
  );

  crearGraficoVisitasLugar(
    datos.visitasPorLugar || []
  );

  crearGraficoDocumentos(
    datos.documentosMensuales || []
  );

  crearGraficoActividades(
    datos.actividadesMensuales || [],
    datos.agendaMensual || []
  );

}


/* =========================================================
   REGISTROS
========================================================= */

function crearGraficoRegistros(registros) {

  const canvas =
    document.getElementById(
      "graficoRegistrosMensuales"
    );

  if (graficoRegistros) {
    graficoRegistros.destroy();
  }


  const labels =
    registros.map(
      registro => registro.nombreMes
    );

  const visitas =
    registros.map(
      registro =>
        Number(registro.visitas || 0)
    );

  const documentos =
    registros.map(
      registro =>
        Number(registro.documentos || 0)
    );

  const noticias =
    registros.map(
      registro =>
        Number(registro.noticias || 0)
    );

  const actividades =
    registros.map(
      registro =>
        Number(registro.actividades || 0)
    );


  graficoRegistros = new Chart(
    canvas,
    {
      type: "bar",

      data: {

        labels,

        datasets: [

          {
            label: "Visitas",

            data: visitas,

            backgroundColor: "#f6a6bb",

            borderRadius: 8,

            borderSkipped: false
          },

          {
            label: "Documentos",

            data: documentos,

            backgroundColor: "#ffcb98",

            borderRadius: 8,

            borderSkipped: false
          },

          {
            label: "Noticias",

            data: noticias,

            backgroundColor: "#8f7cff",

            borderRadius: 8,

            borderSkipped: false
          },

          {
            label: "Actividades",

            data: actividades,

            backgroundColor: "#8fc7eb",

            borderRadius: 8,

            borderSkipped: false
          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
          mode: "index",
          intersect: false
        },

        plugins: {

          legend: {
            position: "bottom",

            labels: {
              usePointStyle: true,
              padding: 20
            }
          },

          tooltip: {

            callbacks: {

              label: function (context) {

                return (
                  `${context.dataset.label}: ` +
                  `${context.parsed.y}`
                );

              }

            }

          }

        },

        scales: {

          x: {
            grid: {
              display: true,
              color: "#e4e8ed"
            }
          },

          y: {

            beginAtZero: true,

            ticks: {
              precision: 0
            },

            grid: {
              color: "#e4e8ed"
            }

          }

        }

      }

    }
  );

}


/* =========================================================
   VISITAS LUGAR
========================================================= */

function crearGraficoVisitasLugar(lugares) {

  const canvas =
    document.getElementById(
      "graficoVisitasLugar"
    );

  if (!canvas) {
    return;
  }

  if (graficoVisitasLugar) {
    graficoVisitasLugar.destroy();
  }


  if (!lugares.length) {

    graficoVisitasLugar =
      new Chart(
        canvas,
        {

          type: "doughnut",

          data: {

            labels: [
              "Sin datos"
            ],

            datasets: [

              {
                data: [1],

                backgroundColor: [
                  "#e8edf3"
                ]

              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

              legend: {
                position: "bottom"
              }

            }

          }

        }
      );

    return;
  }


  const labels =
    lugares.map(
      item => item.lugar
    );

  const cantidades =
    lugares.map(
      item =>
        Number(item.cantidad || 0)
    );


  const colores = [
    "#39a0e6",
    "#ff9850",
    "#f35d7d",
    "#ffc94f",
    "#8f7cff",
    "#48c78e",
    "#6ca8dc",
    "#f28e9c"
  ];


  graficoVisitasLugar =
    new Chart(
      canvas,
      {

        type: "doughnut",

        data: {

          labels,

          datasets: [

            {
              data: cantidades,

              backgroundColor:
                cantidades.map(
                  (_, index) =>
                    colores[
                    index % colores.length
                      ]
                ),

              borderWidth: 3,

              borderColor: "#ffffff"
            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          cutout: "55%",

          plugins: {

            legend: {

              position: "bottom",

              labels: {
                usePointStyle: true,
                padding: 15
              }

            }

          }

        }

      }
    );

}


/* =========================================================
   DOCUMENTOS
========================================================= */

function crearGraficoDocumentos(documentos) {

  const canvas =
    document.getElementById(
      "graficoDocumentos"
    );

  if (!canvas) {
    return;
  }

  if (graficoDocumentos) {
    graficoDocumentos.destroy();
  }


  const labels =
    documentos.map(
      item => item.nombreMes
    );

  const valores =
    documentos.map(
      item =>
        Number(item.documentos || 0)
    );


  graficoDocumentos =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {

              label: "Documentos",

              data: valores,

              borderColor: "#36a0e8",

              backgroundColor:
                "rgba(54,160,232,0.12)",

              borderWidth: 4,

              tension: 0.35,

              fill: false,

              pointRadius: 5,

              pointHoverRadius: 7,

              pointBackgroundColor: "#ffffff",

              pointBorderColor: "#36a0e8",

              pointBorderWidth: 2

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {
              display: false
            }

          },

          scales: {

            x: {
              grid: {
                color: "#e4e8ed"
              }
            },

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0
              },

              grid: {
                color: "#e4e8ed"
              }

            }

          }

        }

      }
    );

}


/* =========================================================
   ACTIVIDADES
========================================================= */

function crearGraficoActividades(
  actividades,
  agenda
) {

  const canvas =
    document.getElementById(
      "graficoActividades"
    );

  if (!canvas) {
    return;
  }

  if (graficoActividades) {
    graficoActividades.destroy();
  }


  const labels =
    actividades.map(
      item => item.nombreMes
    );


  /*
   * ACTIVIDAD DE LA PLATAFORMA
   */
  const valoresActividades =
    actividades.map(
      item =>
        Number(item.actividades || 0)
    );


  /*
   * ACTIVIDADES DE LA AGENDA
   *
   * Se mantienen completamente separadas
   * de las actividades de la plataforma.
   */
  const valoresAgenda =
    agenda.map(
      item =>
        Number(item.actividades || 0)
    );


  graficoActividades =
    new Chart(
      canvas,
      {

        type: "bar",

        data: {

          labels,

          datasets: [

            {
              label:
                "Actividad de la plataforma",

              data:
              valoresActividades,

              backgroundColor:
                "#8fc7eb",

              borderColor:
                "#8fc7eb",

              borderWidth: 1
            },

            {
              label:
                "Actividades de la agenda",

              data:
              valoresAgenda,

              backgroundColor:
                "#8f7cff",

              borderColor:
                "#8f7cff",

              borderWidth: 1
            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {

              display: true,

              position: "bottom"

            },

            tooltip: {

              mode: "index",

              intersect: false

            }

          },

          scales: {

            y: {

              beginAtZero: true,

              ticks: {
                precision: 0
              }

            }

          }

        }

      }
    );

}


/* =========================================================
   SUMMARY
========================================================= */

function actualizarResumen(datos) {

  const resumen =
    datos.resumenTotal || {};


  document.getElementById(
    "totalUsuarios"
  ).textContent =
    resumen.totalUsuarios ?? 0;


  document.getElementById(
    "totalVisitas"
  ).textContent =
    resumen.totalVisitas ?? 0;


  document.getElementById(
    "totalDocumentos"
  ).textContent =
    resumen.totalDocumentos ?? 0;


  document.getElementById(
    "totalNoticias"
  ).textContent =
    resumen.totalNoticias ?? 0;


  document.getElementById(
    "totalActividades"
  ).textContent =
    resumen.totalActividades ?? 0;


  document.getElementById(
    "totalAgenda"
  ).textContent =
    resumen.totalAgenda ?? 0;

}


/* =========================================================
   EXPORTAR CSV
========================================================= */

function descargarCSV() {

  /*
   * Si todavía no hay datos cargados,
   * no intentamos generar el archivo.
   */
  if (!datosEstadisticasActuales) {

    mostrarError(
      "Primero espera a que se carguen las estadísticas."
    );

    return;
  }


  const datos =
    datosEstadisticasActuales;


  const anio =
    filtroAnio.value;

  const periodo =
    filtroPeriodo.value;


  /*
   * -------------------------------------------------------
   * DATOS MENSUALES
   * -------------------------------------------------------
   */

  const registros =
    datos.registrosMensuales || [];

  const actividades =
    datos.actividadesMensuales || [];

  const agenda =
    datos.agendaMensual || [];


  /*
   * Creamos mapas para no mezclar:
   *
   * - Actividades de plataforma
   * - Actividades de agenda
   */

  const mapaActividades =
    new Map();

  actividades.forEach(item => {

    mapaActividades.set(
      Number(item.mes),
      Number(item.actividades || 0)
    );

  });


  const mapaAgenda =
    new Map();

  agenda.forEach(item => {

    mapaAgenda.set(
      Number(item.mes),
      Number(item.actividades || 0)
    );

  });


  /*
   * -------------------------------------------------------
   * FILAS CSV
   * -------------------------------------------------------
   */

  const filas = [];


  /*
   * Información del reporte
   */

  filas.push([
    "ESTADÍSTICAS MUNICIPALES"
  ]);

  filas.push([
    "Año",
    anio
  ]);

  filas.push([
    "Periodo",
    obtenerNombrePeriodo(periodo)
  ]);

  filas.push([]);


  /*
   * Encabezado mensual
   */

  filas.push([
    "Mes",
    "Usuarios",
    "Visitas",
    "Documentos",
    "Noticias",
    "Actividades de plataforma",
    "Actividades de agenda"
  ]);


  /*
   * Cada mes
   */

  registros.forEach(registro => {

    const mes =
      Number(registro.mes || 0);


    filas.push([

      registro.nombreMes || "",

      Number(
        registro.usuarios || 0
      ),

      Number(
        registro.visitas || 0
      ),

      Number(
        registro.documentos || 0
      ),

      Number(
        registro.noticias || 0
      ),

      mapaActividades.get(mes) || 0,

      mapaAgenda.get(mes) || 0

    ]);

  });


  /*
   * -------------------------------------------------------
   * RESUMEN
   * -------------------------------------------------------
   */

  const resumen =
    datos.resumenTotal || {};


  filas.push([]);

  filas.push([
    "RESUMEN DEL SISTEMA"
  ]);

  filas.push([
    "Concepto",
    "Total"
  ]);

  filas.push([
    "Total de usuarios",
    resumen.totalUsuarios ?? 0
  ]);

  filas.push([
    "Total de visitas",
    resumen.totalVisitas ?? 0
  ]);

  filas.push([
    "Total de documentos",
    resumen.totalDocumentos ?? 0
  ]);

  filas.push([
    "Total de noticias",
    resumen.totalNoticias ?? 0
  ]);

  filas.push([
    "Total de actividades",
    resumen.totalActividades ?? 0
  ]);

  filas.push([
    "Total de agenda",
    resumen.totalAgenda ?? 0
  ]);


  /*
   * -------------------------------------------------------
   * CONVERTIR A CSV
   * -------------------------------------------------------
   */

  const contenidoCSV =
    filas
      .map(
        fila =>
          fila
            .map(
              valor =>
                escaparCSV(valor)
            )
            .join(",")
      )
      .join("\r\n");


  /*
   * BOM UTF-8
   *
   * Esto ayuda a que Excel reconozca
   * correctamente tildes y ñ.
   */

  const contenidoFinal =
    "\uFEFF" + contenidoCSV;


  const blob =
    new Blob(
      [contenidoFinal],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const enlace =
    document.createElement("a");

  enlace.href = url;

  enlace.download =
    `estadisticas_${anio}_${obtenerNombreArchivoPeriodo(periodo)}.csv`;


  document.body.appendChild(enlace);

  enlace.click();

  document.body.removeChild(enlace);


  URL.revokeObjectURL(url);

}


/* =========================================================
   ESCAPAR VALORES CSV
========================================================= */

function escaparCSV(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  const texto =
    String(valor);


  /*
   * Si contiene coma, comillas o salto
   * de línea, debe ir entre comillas.
   */

  if (
    texto.includes(",") ||
    texto.includes('"') ||
    texto.includes("\n") ||
    texto.includes("\r")
  ) {

    return `"${texto.replace(
      /"/g,
      '""'
    )}"`;

  }


  return texto;

}


/* =========================================================
   NOMBRE DEL PERIODO
========================================================= */

function obtenerNombrePeriodo(periodo) {

  if (
    !periodo ||
    periodo === "todo"
  ) {

    return "Todo el año";

  }


  const meses = {

    "1": "Enero",
    "2": "Febrero",
    "3": "Marzo",
    "4": "Abril",
    "5": "Mayo",
    "6": "Junio",
    "7": "Julio",
    "8": "Agosto",
    "9": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre"

  };


  return meses[periodo] || periodo;

}


/* =========================================================
   NOMBRE SEGURO PARA ARCHIVO
========================================================= */

function obtenerNombreArchivoPeriodo(periodo) {

  if (
    !periodo ||
    periodo === "todo"
  ) {

    return "todo";

  }


  const meses = {

    "1": "enero",
    "2": "febrero",
    "3": "marzo",
    "4": "abril",
    "5": "mayo",
    "6": "junio",
    "7": "julio",
    "8": "agosto",
    "9": "septiembre",
    "10": "octubre",
    "11": "noviembre",
    "12": "diciembre"

  };


  return meses[periodo] || "periodo";

}


/*
===============================================================
    EXPORTAR PDF (DIVIDIDO EN 2 PARTES OPTIMIZADAS)
===============================================================
*/

async function descargarPDF() {

  // ============================================================
  // 1. VERIFICAR LIBRERÍAS
  // ============================================================

  if (typeof html2canvas === "undefined") {
    mostrarError("No se pudo cargar la librería para generar el PDF.");
    return;
  }

  if (typeof window.jspdf === "undefined") {
    mostrarError("No se pudo cargar la librería PDF.");
    return;
  }

  // ============================================================
  // 2. VERIFICAR QUE EXISTAN LAS ESTADÍSTICAS
  // ============================================================

  if (!datosEstadisticasActuales) {
    mostrarError("Primero espera a que se carguen las estadísticas.");
    return;
  }

  // ============================================================
  // 3. OBTENER EL CONTENIDO DEL DASHBOARD
  // ============================================================

  const contenido = document.querySelector(".main-content");

  if (!contenido) {
    mostrarError("No se encontró el contenido del dashboard.");
    return;
  }

  try {

    // Ocultar elementos que no deben aparecer en el PDF
    document.body.classList.add("exportando-pdf");

    // Pequeña espera para que el navegador aplique los estilos
    await esperar(300);

    // ============================================================
    // 4. CAPTURA COMPLETA DEL DASHBOARD
    // ============================================================

    const canvasCompleto = await html2canvas(contenido, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#eef3f8",

      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,

      logging: false
    });

    // Restaurar la apariencia normal de la página
    document.body.classList.remove("exportando-pdf");

    // ============================================================
    // 5. DEFINIR PUNTOS DE CORTE
    // ============================================================

    const alturaTotal = canvasCompleto.height;

    // Primera parte = 54% del dashboard
    const corteParte1 = Math.floor(alturaTotal * 0.54);

    // Segunda parte = todo lo que queda
    const corteParte2 = alturaTotal - corteParte1;


    // ============================================================
    // 6. CREAR CANVAS PARA LA PARTE 1
    // ============================================================

    const canvasParte1 = document.createElement("canvas");

    canvasParte1.width = canvasCompleto.width;
    canvasParte1.height = corteParte1;

    const ctx1 = canvasParte1.getContext("2d");

    ctx1.drawImage(
      canvasCompleto,

      // Área que se toma del canvas original
      0,
      0,
      canvasCompleto.width,
      corteParte1,

      // Área donde se coloca
      0,
      0,
      canvasCompleto.width,
      corteParte1
    );


    // ============================================================
    // 7. CREAR CANVAS PARA LA PARTE 2
    // ============================================================

    const canvasParte2 = document.createElement("canvas");

    canvasParte2.width = canvasCompleto.width;
    canvasParte2.height = corteParte2;

    const ctx2 = canvasParte2.getContext("2d");

    ctx2.drawImage(
      canvasCompleto,

      // Comenzar desde donde terminó la parte 1
      0,
      corteParte1,
      canvasCompleto.width,
      corteParte2,

      // Colocar desde el inicio del segundo canvas
      0,
      0,
      canvasCompleto.width,
      corteParte2
    );


    // ============================================================
    // 8. GENERAR PDF CON 2 PÁGINAS (A4 HORIZONTAL)
    // ============================================================

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Dimensiones A4 horizontal
    const pageWidth = 297;
    const pageHeight = 210;

    // Margen del PDF
    const margin = 10;

    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);


    // ============================================================
    // 9. FUNCIÓN PARA CENTRAR CADA CANVAS EN LA PÁGINA
    // ============================================================

    function agregarImagenCentrada(pdfDoc, canvasImagen) {

      const escala = Math.min(
        availableWidth / canvasImagen.width,
        availableHeight / canvasImagen.height
      );

      const imgWidth = canvasImagen.width * escala;
      const imgHeight = canvasImagen.height * escala;

      // Centrar horizontalmente
      const posX = (pageWidth - imgWidth) / 2;

      // Centrar verticalmente
      const posY = (pageHeight - imgHeight) / 2;

      pdfDoc.addImage(
        canvasImagen,
        "PNG",
        posX,
        posY,
        imgWidth,
        imgHeight
      );
    }


    // ============================================================
    // 10. AGREGAR PARTE 1 A LA PRIMERA PÁGINA
    // ============================================================

    agregarImagenCentrada(
      pdf,
      canvasParte1
    );


    // ============================================================
    // 11. CREAR SEGUNDA PÁGINA
    // ============================================================

    pdf.addPage();


    // ============================================================
    // 12. AGREGAR PARTE 2 A LA SEGUNDA PÁGINA
    // ============================================================

    agregarImagenCentrada(
      pdf,
      canvasParte2
    );


    // ============================================================
    // 13. GENERAR NOMBRE DEL ARCHIVO
    // ============================================================

    const anio = filtroAnio.value;
    const periodo = filtroPeriodo.value;

    const nombreArchivo =
      `estadisticas_${anio}_${obtenerNombreArchivoPeriodo(periodo)}.pdf`;


    // ============================================================
    // 14. DESCARGAR PDF
    // ============================================================

    pdf.save(nombreArchivo);

  } catch (error) {

    console.error("Error al generar el PDF:", error);

    mostrarError(
      "Ocurrió un error al generar el PDF."
    );

  } finally {

    // Asegurarse de que la página vuelva a su estado normal
    document.body.classList.remove("exportando-pdf");
  }
}


/* =========================================================
   ESPERAR
========================================================= */

function esperar(milisegundos) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milisegundos
      )
  );

}


/* =========================================================
   UTIL
========================================================= */

function establecerTexto(
  id,
  valor
) {

  const elemento =
    document.getElementById(id);

  if (elemento) {
    elemento.textContent = valor;
  }

}


function formatearNumero(numero) {

  return new Intl.NumberFormat(
    "es-PE"
  ).format(numero);

}


/* =========================================================
   STATES
========================================================= */

function mostrarCarga() {

  if (estadoCarga) {
    estadoCarga.classList.add(
      "visible"
    );
  }

}


function ocultarCarga() {

  if (estadoCarga) {
    estadoCarga.classList.remove(
      "visible"
    );
  }

}


function mostrarError(mensaje) {

  const textoError =
    document.getElementById(
      "textoError"
    );

  if (textoError) {
    textoError.textContent = mensaje;
  }

  if (mensajeError) {
    mensajeError.classList.add(
      "visible"
    );
  }

}


function ocultarError() {

  if (mensajeError) {
    mensajeError.classList.remove(
      "visible"
    );
  }

}


/* =========================================================
   SESIÓN / PROFILE
========================================================= */

let usuarioSesionActual = null;


/* =========================================================
   INICIALIZAR SESIÓN
========================================================= */

async function inicializarSesion() {

  try {

    const respuesta = await fetch(
      `${API_URL}/usuarios/auth/verificar`,
      {
        method: "GET",
        credentials: "include"
      }
    );

    if (!respuesta.ok) {

      throw new Error(
        `Error HTTP ${respuesta.status}`
      );
    }

    const usuario = await respuesta.json();

    console.log("Usuario autenticado:", usuario);

    usuarioSesionActual = usuario;

    cargarFotoPerfil(usuario);

    actualizarPerfilFrontend(usuario);

  } catch (error) {

    console.error(
      "Error verificando sesión:",
      error
    );
  }
}

function cargarFotoPerfil(usuario) {

  const imagen =
    document.getElementById("fotoPerfilHeader");

  if (!imagen) {
    return;
  }

  if (
    usuario &&
    usuario.fotoPerfil &&
    usuario.fotoPerfil.trim() !== ""
  ) {

    imagen.src = usuario.fotoPerfil;

  } else {

    imagen.src =
      "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-photo-183042379.jpg";
  }

  imagen.onerror = function () {

    imagen.src =
      "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-photo-183042379.jpg";
  };
}

/* =========================================================
   ACTUALIZAR PERFIL FRONTEND
========================================================= */

function actualizarPerfilFrontend(usuario) {

  if (!usuario) {
    return;
  }


  /*
   * NOMBRE
   */

  establecerTexto(
    "nombreUsuario",
    `${usuario.nombres || ""} ${usuario.apellidos || ""}`.trim()
  );


  /*
   * USUARIO
   */

  establecerTexto(
    "usuarioSesion",
    usuario.usuario || ""
  );


  /*
   * CORREO
   */

  establecerTexto(
    "correoUsuario",
    usuario.correo || ""
  );


  /*
   * ROL
   */

  establecerTexto(
    "rolUsuario",
    formatearRol(usuario.rol)
  );


  /*
   * FOTO DE PERFIL
   */

  const fotoPerfil =
    document.getElementById(
      "fotoPerfil"
    );


  if (fotoPerfil) {

    fotoPerfil.src =
      usuario.fotoPerfil ||
      "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-photo-183042379.jpg";

  }

}


/* =========================================================
   FORMATEAR ROL
========================================================= */

function formatearRol(rol) {

  if (rol === "ADMIN") {
    return "Administrador";
  }

  if (rol === "PERSONAL_ADMINISTRATIVO") {
    return "Personal administrativo";
  }

  return rol || "";
}





/* =========================================================
   INICIAR SESIÓN DEL FRONTEND
========================================================= */

inicializarSesion();
