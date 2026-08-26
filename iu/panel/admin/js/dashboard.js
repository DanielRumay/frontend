/* =========================================================
   DASHBOARD ADMINISTRATIVO
========================================================= */

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";


/* =========================================================
   ELEMENTOS DEL DOM
========================================================= */

const totalUsuarios =
  document.getElementById("totalUsuarios");

const totalDocumentos =
  document.getElementById("totalDocumentos");

const totalActividades =
  document.getElementById("totalActividades");

const totalVisitas =
  document.getElementById("totalVisitas");

const tablaActividades =
  document.getElementById("tablaActividades");

const tablaTodasActividades =
  document.getElementById("tablaTodasActividades");

const usuariosConectados =
  document.getElementById("usuariosConectados");

const porcentajePortal =
  document.getElementById("porcentajePortal");

const btnPerfil =
  document.getElementById("btnPerfil");

const menuPerfil =
  document.getElementById("menuPerfil");

const btnCerrarSesion =
  document.getElementById("btnCerrarSesion");

const btnVerTodasActividades =
  document.getElementById("btnVerTodasActividades");

const modalActividades =
  document.getElementById("modalActividades");

const btnCerrarModal =
  document.getElementById("btnCerrarModal");


/* =========================================================
   VARIABLES
========================================================= */

let usuariosGlobal = [];
let documentosGlobal = [];
let agendaGlobal = [];
let visitasGlobal = [];
let noticiasGlobal = [];
let actividadesGlobal = [];

let graficoRegistros = null;
let graficoUsoPortal = null;


/*
 * Evita que varias peticiones intenten
 * redirigir al login al mismo tiempo.
 */
let redirigiendoLogin = false;


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    configurarPerfil();

    configurarModalActividades();


    /*
     * PRIMERO:
     * comprobar que existe una sesión válida.
     */
    const sesionValida =
      await verificarSesion();


    /*
     * Si no existe sesión,
     * verificarSesion() ya redirigió.
     */
    if (!sesionValida) {
      return;
    }


    /*
     * Cargar dashboard.
     */
    await cargarDashboard();


    /*
     * Actualizar usuarios conectados
     * cada 5 segundos.
     */
    setInterval(
      actualizarUsuariosEnTiempoReal,
      5000
    );


    /*
     * Actualizar actividad inmediatamente.
     */
    mantenerSesionActiva();


    /*
     * Mantener sesión activa cada minuto.
     */
    setInterval(
      mantenerSesionActiva,
      60 * 1000
    );

  }
);


/* =========================================================
   VERIFICAR SESIÓN
========================================================= */

async function verificarSesion() {

  /*
   * Si ya estamos redirigiendo,
   * no realizar más peticiones.
   */
  if (redirigiendoLogin) {
    return false;
  }


  try {

    const respuesta =
      await fetch(
        `${API_URL}/usuarios/auth/verificar`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        }
      );


    /*
     * 401 significa:
     *
     * - no existe sesión
     * - usuario eliminado
     * - usuario inactivo
     */
    if (respuesta.status === 401) {

      redirigirAlLogin();

      return false;

    }


    if (!respuesta.ok) {

      console.error(
        "No se pudo verificar la sesión."
      );

      redirigirAlLogin();

      return false;

    }


    /*
     * El backend devuelve el usuario.
     */
    const usuario =
      await respuesta.json();


    /*
     * Comprobación adicional
     * desde el frontend.
     */
    if (
      !usuario ||
      usuario.activo !== true
    ) {

      redirigirAlLogin();

      return false;

    }


    return true;


  } catch (error) {

    console.error(
      "Error verificando sesión:",
      error
    );


    redirigirAlLogin();

    return false;

  }

}


/* =========================================================
   REDIRIGIR AL LOGIN
========================================================= */

function redirigirAlLogin() {

  /*
   * Evitar múltiples redirecciones.
   */
  if (redirigiendoLogin) {
    return;
  }


  redirigiendoLogin = true;


  /*
   * Evitar que el usuario siga
   * interactuando con el dashboard.
   */
  if (document.body) {

    document.body.style.pointerEvents =
      "none";

    document.body.style.opacity =
      "0.5";

  }


  /*
   * IMPORTANTE:
   *
   * Esta es la página de inicio
   * de sesión.
   */
  window.location.replace(
    "../error.html"
  );

}


/* =========================================================
   CARGAR DASHBOARD
========================================================= */

async function cargarDashboard() {

  /*
   * No cargar nada si ya se está
   * redirigiendo al login.
   */
  if (redirigiendoLogin) {
    return;
  }


  try {

    const resultados =
      await Promise.all([

        fetch(`${API_URL}/usuarios`, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        }),

        fetch(`${API_URL}/documentos`, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        }),

        fetch(`${API_URL}/agenda`, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        }),

        fetch(`${API_URL}/visitas`, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        }),

        fetch(`${API_URL}/noticias`, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        }),

        fetch(`${API_URL}/actividades/recientes`, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        })

      ]);


    /* ============================================
       VERIFICAR SESIÓN
    ============================================ */

    /*
     * /usuarios puede provocar que el backend
     * detecte usuarios inactivos.
     *
     * Si esta petición devuelve 401,
     * regresar al login.
     */
    if (resultados[0].status === 401) {

      redirigirAlLogin();

      return;

    }


    /* ============================================
       VERIFICAR RESPUESTAS
    ============================================ */

    if (!resultados[0].ok)
      throw new Error(
        "No se pudieron obtener los usuarios."
      );


    if (!resultados[1].ok)
      throw new Error(
        "No se pudieron obtener los documentos."
      );


    if (!resultados[2].ok)
      throw new Error(
        "No se pudo obtener la agenda."
      );


    if (!resultados[3].ok)
      throw new Error(
        "No se pudieron obtener las visitas."
      );


    if (!resultados[4].ok)
      throw new Error(
        "No se pudieron obtener las noticias."
      );


    if (!resultados[5].ok)
      throw new Error(
        "No se pudieron obtener las actividades."
      );


    /* ============================================
       CONVERTIR RESPUESTAS
    ============================================ */

    usuariosGlobal =
      await resultados[0].json();


    documentosGlobal =
      await resultados[1].json();


    agendaGlobal =
      await resultados[2].json();


    visitasGlobal =
      await resultados[3].json();


    noticiasGlobal =
      await resultados[4].json();


    actividadesGlobal =
      await resultados[5].json();


    /*
     * Asegurar que usuariosGlobal
     * siempre sea un arreglo.
     */
    if (!Array.isArray(usuariosGlobal)) {
      usuariosGlobal = [];
    }


    if (!Array.isArray(documentosGlobal)) {
      documentosGlobal = [];
    }


    if (!Array.isArray(agendaGlobal)) {
      agendaGlobal = [];
    }


    if (!Array.isArray(visitasGlobal)) {
      visitasGlobal = [];
    }


    if (!Array.isArray(noticiasGlobal)) {
      noticiasGlobal = [];
    }


    if (!Array.isArray(actividadesGlobal)) {
      actividadesGlobal = [];
    }


    /* ============================================
       ACTUALIZAR DASHBOARD
    ============================================ */

    actualizarTarjetas();

    generarGraficoRegistros();

    generarGraficoUsoPortal();

    mostrarActividades();

    mostrarUsuariosConectados();


  } catch (error) {

    console.error(
      "Error cargando dashboard:",
      error
    );

  }

}


/* =========================================================
   ACTUALIZAR TARJETAS
========================================================= */

function actualizarTarjetas() {

  if (totalUsuarios) {

    totalUsuarios.textContent =
      usuariosGlobal.length;

  }


  if (totalDocumentos) {

    totalDocumentos.textContent =
      documentosGlobal.length;

  }


  if (totalActividades) {

    totalActividades.textContent =
      agendaGlobal.length;

  }


  if (totalVisitas) {

    totalVisitas.textContent =
      visitasGlobal.length;

  }

}


/* =========================================================
   GRÁFICO REGISTROS DEL SISTEMA
========================================================= */

function generarGraficoRegistros() {

  const canvas =
    document.getElementById(
      "graficoRegistros"
    );


  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext("2d");


  const anioActual =
    new Date().getFullYear();


  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic"
  ];


  const usuariosPorMes =
    contarPorMes(
      usuariosGlobal,
      "fechaRegistro",
      anioActual
    );


  const documentosPorMes =
    contarPorMes(
      documentosGlobal,
      "fechaPublicacion",
      anioActual
    );


  const actividadesPorMes =
    contarPorMes(
      agendaGlobal,
      "fecha",
      anioActual
    );


  const visitasPorMes =
    contarPorMes(
      visitasGlobal,
      "fechaRegistro",
      anioActual
    );


  if (graficoRegistros) {

    graficoRegistros.destroy();

    graficoRegistros = null;

  }


  graficoRegistros =
    new Chart(ctx, {

      type: "bar",

      data: {

        labels: meses,

        datasets: [

          {
            label: "Usuarios",
            data: usuariosPorMes,
            borderRadius: 8
          },

          {
            label: "Documentos",
            data: documentosPorMes,
            borderRadius: 8
          },

          {
            label: "Actividades",
            data: actividadesPorMes,
            borderRadius: 8
          },

          {
            label: "Visitas",
            data: visitasPorMes,
            borderRadius: 8
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

    });

}


/* =========================================================
   CONTAR REGISTROS POR MES
========================================================= */

function contarPorMes(
  datos,
  campoFecha,
  anio
) {

  const cantidades =
    new Array(12).fill(0);


  if (!Array.isArray(datos)) {
    return cantidades;
  }


  datos.forEach(item => {

    if (!item) {
      return;
    }


    const fecha =
      convertirFecha(
        item[campoFecha]
      );


    if (!fecha) {
      return;
    }


    if (
      fecha.getFullYear() === anio
    ) {

      cantidades[
        fecha.getMonth()
        ]++;

    }

  });


  return cantidades;

}


/* =========================================================
   CONVERTIR FECHAS
========================================================= */

function convertirFecha(valor) {

  if (!valor) {
    return null;
  }


  if (valor instanceof Date) {

    return isNaN(valor.getTime())
      ? null
      : valor;

  }


  if (
    typeof valor === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(valor)
  ) {

    const fecha =
      new Date(valor);


    if (!isNaN(fecha.getTime())) {

      return fecha;

    }

  }


  if (
    typeof valor === "string" &&
    /^\d{2}\/\d{2}\/\d{4}$/.test(valor)
  ) {

    const partes =
      valor.split("/");


    const fecha =
      new Date(
        Number(partes[2]),
        Number(partes[1]) - 1,
        Number(partes[0])
      );


    if (!isNaN(fecha.getTime())) {

      return fecha;

    }

  }


  const fecha =
    new Date(valor);


  if (!isNaN(fecha.getTime())) {

    return fecha;

  }


  return null;

}


/* =========================================================
   USO DEL PORTAL
========================================================= */

function generarGraficoUsoPortal() {

  const canvas =
    document.getElementById(
      "graficoUsoPortal"
    );


  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext("2d");


  const total =
    usuariosGlobal.length;


  const activos =
    usuariosGlobal.filter(
      usuario =>
        usuario &&
        usuario.activo === true
    ).length;


  let porcentaje = 0;


  if (total > 0) {

    porcentaje =
      Math.round(
        (activos / total) * 100
      );

  }


  if (porcentajePortal) {

    porcentajePortal.textContent =
      `${porcentaje}%`;

  }


  if (graficoUsoPortal) {

    graficoUsoPortal.destroy();

    graficoUsoPortal = null;

  }


  graficoUsoPortal =
    new Chart(ctx, {

      type: "doughnut",

      data: {

        labels: [
          "Usuarios activos",
          "Usuarios inactivos"
        ],

        datasets: [

          {
            data: [
              activos,
              Math.max(
                total - activos,
                0
              )
            ],

            borderWidth: 0
          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "68%",

        plugins: {

          legend: {
            display: false
          }

        }

      }

    });

}


/* =========================================================
   ACTIVIDAD RECIENTE
========================================================= */

function mostrarActividades() {

  if (!tablaActividades) {
    return;
  }


  tablaActividades.innerHTML = "";


  if (
    !actividadesGlobal ||
    actividadesGlobal.length === 0
  ) {

    tablaActividades.innerHTML = `

      <tr class="empty-row">

        <td colspan="3">
          No existen actividades registradas.
        </td>

      </tr>

    `;

    return;

  }


  actividadesGlobal.forEach(
    actividad => {

      tablaActividades.appendChild(
        crearFilaActividad(actividad)
      );

    }
  );

}


/* =========================================================
   CREAR FILA DE ACTIVIDAD
========================================================= */

function crearFilaActividad(
  actividad
) {

  const fila =
    document.createElement("tr");


  const fecha =
    convertirFecha(
      actividad.fecha
    );


  let fechaTexto =
    "Fecha no disponible";


  if (fecha) {

    fechaTexto =
      fecha.toLocaleString(
        "es-PE",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );

  }


  fila.innerHTML = `

    <td>
      ${fechaTexto}
    </td>

    <td>
      ${escaparHTML(
    actividad.usuario || "-"
  )}
    </td>

    <td>
      ${escaparHTML(
    actividad.accion || "-"
  )}
    </td>

  `;


  return fila;

}


/* =========================================================
   VER TODAS LAS ACTIVIDADES
========================================================= */

async function cargarTodasLasActividades() {

  if (!tablaTodasActividades) {
    return;
  }


  tablaTodasActividades.innerHTML = `

    <tr class="empty-row">

      <td colspan="3">
        Cargando actividades...
      </td>

    </tr>

  `;


  try {

    const respuesta =
      await fetch(
        `${API_URL}/actividades`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        }
      );


    /*
     * Si la sesión ya no existe,
     * volver al login.
     */
    if (respuesta.status === 401) {

      redirigirAlLogin();

      return;

    }


    if (!respuesta.ok) {

      throw new Error(
        "No se pudieron obtener todas las actividades."
      );

    }


    const actividades =
      await respuesta.json();


    tablaTodasActividades.innerHTML = "";


    if (
      !actividades ||
      actividades.length === 0
    ) {

      tablaTodasActividades.innerHTML = `

        <tr class="empty-row">

          <td colspan="3">
            No existen actividades registradas.
          </td>

        </tr>

      `;

      return;

    }


    /*
     * Ordenar de más reciente
     * a más antigua.
     */
    actividades.sort(
      (a, b) => {

        const fechaA =
          convertirFecha(a.fecha);


        const fechaB =
          convertirFecha(b.fecha);


        if (!fechaA || !fechaB) {
          return 0;
        }


        return fechaB - fechaA;

      }
    );


    actividades.forEach(
      actividad => {

        tablaTodasActividades.appendChild(
          crearFilaActividad(actividad)
        );

      }
    );


  } catch (error) {

    console.error(
      "Error cargando todas las actividades:",
      error
    );


    tablaTodasActividades.innerHTML = `

      <tr class="empty-row">

        <td colspan="3">
          No se pudieron cargar las actividades.
        </td>

      </tr>

    `;

  }

}


/* =========================================================
   CONFIGURAR MODAL DE ACTIVIDADES
========================================================= */

function configurarModalActividades() {

  if (
    !btnVerTodasActividades ||
    !modalActividades
  ) {
    return;
  }


  btnVerTodasActividades.addEventListener(
    "click",
    async () => {

      modalActividades.classList.add(
        "visible"
      );


      await cargarTodasLasActividades();

    }
  );


  if (btnCerrarModal) {

    btnCerrarModal.addEventListener(
      "click",
      cerrarModalActividades
    );

  }


  modalActividades.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        modalActividades
      ) {

        cerrarModalActividades();

      }

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        modalActividades.classList.contains(
          "visible"
        )
      ) {

        cerrarModalActividades();

      }

    }
  );

}


/* =========================================================
   CERRAR MODAL
========================================================= */

function cerrarModalActividades() {

  if (!modalActividades) {
    return;
  }


  modalActividades.classList.remove(
    "visible"
  );

}


/* =========================================================
   USUARIOS CONECTADOS
========================================================= */

function mostrarUsuariosConectados() {

  if (!usuariosConectados) {
    return;
  }


  const activos =
    usuariosGlobal.filter(
      usuario =>
        usuario &&
        usuario.activo === true
    );


  usuariosConectados.innerHTML = "";


  if (activos.length === 0) {

    usuariosConectados.innerHTML = `

      <div class="sin-usuarios">

        <span class="estado-online"></span>

        <span>
          No hay usuarios conectados.
        </span>

      </div>

    `;

    return;

  }


  activos.forEach(usuario => {

    const elemento =
      document.createElement("div");


    elemento.className =
      "usuario-conectado";


    const nombre =
      `${usuario.nombres || ""} ${
        usuario.apellidos || ""
      }`.trim();


    const nombreMostrar =
      nombre ||
      usuario.usuario ||
      "Usuario";


    elemento.innerHTML = `

      <span class="estado-online"></span>

      <span class="usuario-conectado-nombre">
        ${escaparHTML(nombreMostrar)}
      </span>

    `;


    usuariosConectados.appendChild(
      elemento
    );

  });

}


/* =========================================================
   PERFIL
========================================================= */

function configurarPerfil() {

  if (
    !btnPerfil ||
    !menuPerfil
  ) {
    return;
  }


  btnPerfil.addEventListener(
    "click",
    event => {

      event.stopPropagation();


      menuPerfil.classList.toggle(
        "visible"
      );

    }
  );


  document.addEventListener(
    "click",
    event => {

      if (
        !menuPerfil.contains(
          event.target
        ) &&
        !btnPerfil.contains(
          event.target
        )
      ) {

        menuPerfil.classList.remove(
          "visible"
        );

      }

    }
  );


  if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener(
      "click",
      cerrarSesion
    );

  }

}


/* =========================================================
   CERRAR SESIÓN
========================================================= */

async function cerrarSesion() {

  if (!btnCerrarSesion) {
    return;
  }


  if (redirigiendoLogin) {
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
     * Aunque el backend responda 401,
     * igualmente debemos regresar al login.
     */
    if (
      respuesta.ok ||
      respuesta.status === 401
    ) {

      redirigirAlLogin();

      return;

    }


    throw new Error(
      "No se pudo cerrar la sesión."
    );


  } catch (error) {

    console.error(
      "Error cerrando sesión:",
      error
    );


    btnCerrarSesion.disabled =
      false;


    alert(
      "No se pudo cerrar la sesión. Intente nuevamente."
    );

  }

}


/* =========================================================
   ACTUALIZAR USUARIOS EN TIEMPO REAL
========================================================= */

async function actualizarUsuariosEnTiempoReal() {

  /*
   * No realizar peticiones si ya se
   * está enviando al login.
   */
  if (redirigiendoLogin) {
    return;
  }


  try {

    const respuesta =
      await fetch(
        `${API_URL}/usuarios`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        }
      );


    /*
     * Si la sesión fue invalidada,
     * salir inmediatamente.
     */
    if (respuesta.status === 401) {

      redirigirAlLogin();

      return;

    }


    if (!respuesta.ok) {

      console.error(
        "No se pudieron actualizar los usuarios."
      );

      return;

    }


    const usuarios =
      await respuesta.json();


    usuariosGlobal =
      Array.isArray(usuarios)
        ? usuarios
        : [];


    /*
     * Actualizar lista de usuarios conectados.
     */
    mostrarUsuariosConectados();


    /*
     * Actualizar gráfico de uso
     * del portal.
     */
    generarGraficoUsoPortal();


  } catch (error) {

    console.error(
      "Error actualizando usuarios:",
      error
    );

  }

}


/* =========================================================
   MANTENER SESIÓN ACTIVA
========================================================= */

async function mantenerSesionActiva() {

  /*
   * No realizar peticiones si ya
   * estamos redirigiendo.
   */
  if (redirigiendoLogin) {
    return;
  }


  try {

    const respuesta =
      await fetch(
        `${API_URL}/usuarios/actividad`,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store"
        }
      );


    /*
     * El backend devuelve 401 cuando:
     *
     * - no existe sesión
     * - el usuario fue eliminado
     * - el usuario fue marcado como inactivo
     */
    if (respuesta.status === 401) {

      redirigirAlLogin();

      return;

    }


    if (!respuesta.ok) {

      console.error(
        "No se pudo mantener activa la sesión."
      );

      return;

    }


    console.log(
      "Sesión activa."
    );


  } catch (error) {

    console.error(
      "Error actualizando actividad:",
      error
    );

  }

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(texto) {

  const div =
    document.createElement("div");


  div.textContent =
    texto;


  return div.innerHTML;

}
