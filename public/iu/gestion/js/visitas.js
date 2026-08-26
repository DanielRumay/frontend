/* ==========================================
   VARIABLES GLOBALES - VISITAS
========================================== */
let visitasGlobal = [];
let ultimoID = 0;

let filtroAnio = "";
let filtroMes = "";
let filtroLugar = "";

/* PAGINACIÓN */
let paginaActual = 1;
const elementosPorPagina = 10;
let visitasFiltradas = [];

/* ==========================================
   CARGA INICIAL Y API
========================================== */
async function cargarVisitas() {
  try {
    const response = await fetch("http://localhost:8080/visitas");
    const visitas = await response.json();

    visitasGlobal = visitas;

    generarSidebar(visitas);
    renderizarTabla(visitas);
  } catch (error) {
    console.error("Error al cargar visitas:", error);
  }
}

/* ==========================================
   RENDERIZADO DE TABLA Y SIDEBAR
========================================== */
function renderizarTabla(visitas) {

  visitasFiltradas = visitas;

  const tbody = document.getElementById("tablaVisitas");
  if (!tbody) return;

  tbody.innerHTML = "";

  const inicio = (paginaActual - 1) * elementosPorPagina;
  const fin = inicio + elementosPorPagina;

  const pagina = visitas.slice(inicio, fin);

  pagina.forEach((v, index) => {

    tbody.innerHTML += `
        <tr>
            <td>${inicio + index + 1}</td>
            <td>${v.fechaRegistro}</td>
            <td>${v.nombreVisitante}</td>
            <td>${v.dniVisitante}</td>
            <td>${v.funcionarioVisitado}</td>
            <td>${v.horaEntradaRegistrada}</td>
            <td>${v.horaSalidaRegistrada || "--"}</td>
            <td>${v.motivo}</td>
            <td>${v.lugarEspecificoVisita}</td>
        </tr>
    `;

  });

  renderizarPaginacion();
}

function renderizarPaginacion() {

  const contenedor = document.getElementById("paginacion");

  if (!contenedor) return;

  const total = visitasFiltradas.length;

  const inicio = total === 0 ? 0 : (paginaActual - 1) * elementosPorPagina + 1;

  const fin = Math.min(
    paginaActual * elementosPorPagina,
    total
  );

  const totalPaginas = Math.ceil(total / elementosPorPagina);

  contenedor.innerHTML = `

    <button id="btnAnterior"
    ${paginaActual===1 ? "disabled" : ""}>
    <
</button>

    <span>
      ${inicio}-${fin} de ${total}
    </span>

    <button id="btnSiguiente"
    ${paginaActual===totalPaginas || totalPaginas===0 ? "disabled" : ""}>
    >
</button>

  `;

  const anterior = document.getElementById("btnAnterior");
  const siguiente = document.getElementById("btnSiguiente");

  if(anterior){

    anterior.onclick=()=>{

      paginaActual--;

      renderizarTabla(visitasFiltradas);

    };

  }

  if(siguiente){

    siguiente.onclick=()=>{

      paginaActual++;

      renderizarTabla(visitasFiltradas);

    };

  }

}

function generarSidebar(datos) {
  generarAnios(datos);
  generarMeses();
  generarLugares(datos);
}

function generarAnios(datos){

  const lista = document.getElementById("listaAnios");

  if(!lista) return;

  lista.innerHTML = "";

  const anios = [
    ...new Set(
      datos.map(v => v.fechaRegistro.substring(0,4))
    )
  ].sort((a,b)=>b-a);

  anios.forEach(anio=>{

    const li = document.createElement("li");

    li.textContent = anio;

    li.onclick = ()=>{

      filtroAnio =
        filtroAnio === anio ? "" : anio;

      activarItem(lista,li,filtroAnio);

      aplicarFiltros();

    };

    lista.appendChild(li);

  });

  const input = document.getElementById("buscarAnio");

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

function generarMeses(){

  const lista = document.getElementById("listaMeses");

  if(!lista) return;

  lista.innerHTML="";

  const meses=[

    ["01","Enero"],
    ["02","Febrero"],
    ["03","Marzo"],
    ["04","Abril"],
    ["05","Mayo"],
    ["06","Junio"],
    ["07","Julio"],
    ["08","Agosto"],
    ["09","Septiembre"],
    ["10","Octubre"],
    ["11","Noviembre"],
    ["12","Diciembre"]

  ];

  meses.forEach(([numero,nombre])=>{

    const li=document.createElement("li");

    li.textContent=nombre;

    li.onclick=()=>{

      filtroMes=
        filtroMes===numero?"":numero;

      activarItem(lista,li,filtroMes);

      aplicarFiltros();

    };

    lista.appendChild(li);

  });

  const input=document.getElementById("buscarMes");

  if(input){

    input.oninput=function(){

      const texto=this.value.toLowerCase();

      lista.querySelectorAll("li").forEach(li=>{

        li.style.display=
          li.textContent.toLowerCase().includes(texto)
            ? ""
            : "none";

      });

    };

  }

}

function generarLugares(datos){

  const lista=document.getElementById("listaLugares");

  if(!lista) return;

  lista.innerHTML="";

  const lugares=[...new Set(datos.map(v => v.lugarEspecificoVisita))
  ].sort();

  lugares.forEach(lugar=>{

    const li=document.createElement("li");

    li.textContent=lugar;

    li.onclick=()=>{

      filtroLugar=
        filtroLugar===lugar?"":lugar;

      activarItem(lista,li,filtroLugar);

      aplicarFiltros();

    };

    lista.appendChild(li);

  });

  const input=document.getElementById("buscarLugar");

  if(input){

    input.oninput=function(){

      const texto=this.value.toLowerCase();

      lista.querySelectorAll("li").forEach(li=>{

        li.style.display=
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
function aplicarFiltros() {
  const inputVisitante = document.getElementById("buscarVisitante");
  const inputFuncionario = document.getElementById("buscarFuncionario");

  if (!inputVisitante || !inputFuncionario) return;

  const visitante = inputVisitante.value.toLowerCase();
  const funcionario = inputFuncionario.value.toLowerCase();

  const filtradas = visitasGlobal.filter(v => {
    const anioOK = !filtroAnio || v.fechaRegistro.startsWith(filtroAnio);
    const mesOK = !filtroMes || v.fechaRegistro.split("-")[1] === filtroMes;
    const lugarOK =
      !filtroLugar ||
      v.lugarEspecificoVisita === filtroLugar;
    const visitanteOK = v.nombreVisitante.toLowerCase().includes(visitante);
    const funcionarioOK = v.funcionarioVisitado.toLowerCase().includes(funcionario);

    return anioOK && mesOK && lugarOK && visitanteOK && funcionarioOK;
  });

  paginaActual = 1;
  renderizarTabla(filtradas);
}

/* ==========================================
   POLLING Y NOTIFICACIONES
========================================== */
async function verificarNuevosDatos(){

  try{

    const response = await fetch("http://localhost:8080/visitas");

    const nuevasVisitas = await response.json();

    if(nuevasVisitas.length > visitasGlobal.length){

      visitas.sort((a,b)=>{

        const fechaA = new Date(
          `${a.fechaRegistro}T${a.horaEntradaRegistrada}`
        );

        const fechaB = new Date(
          `${b.fechaRegistro}T${b.horaEntradaRegistrada}`
        );

        return fechaB - fechaA;

      });

      visitasGlobal = visitas;

      aplicarFiltros();

      mostrarNotificacion("Se registró una nueva visita.");

    }

  }catch(error){

    console.error(error);

  }

}

function mostrarNotificacion(texto) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = texto;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ==========================================
   INICIALIZACIÓN Y EVENTOS DOM
========================================== */
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tablaVisitas")) {
    cargarVisitas();
    setInterval(verificarNuevosDatos, 5000);
  }

  const buscarVisitante = document.getElementById("buscarVisitante");
  if (buscarVisitante) {
    buscarVisitante.addEventListener("input", aplicarFiltros);
  }

  const buscarFuncionario = document.getElementById("buscarFuncionario");
  if (buscarFuncionario) {
    buscarFuncionario.addEventListener("input", aplicarFiltros);
  }

  // Toggles de la barra lateral (Sidebar)
  document.querySelectorAll(".sidebar-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("active");
    });
  });
});
