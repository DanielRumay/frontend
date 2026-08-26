/* ==========================================
   VARIABLES GLOBALES
========================================== */

let agendaGlobal = [];

let filtroAnioAgenda = "";
let filtroMesAgenda = "";
let filtroLugarAgenda = "";

/* ==========================================
   CARGAR AGENDA
========================================== */

async function cargarAgenda() {

  try {

    const response = await fetch("http://localhost:8080/agenda");

    const agenda = await response.json();

    agendaGlobal = agenda;

    generarSidebarAgenda(agenda);

    renderizarAgenda(agenda);



  } catch(error) {

    console.error(error);

  }

}

/* ==========================================
   RENDER TABLA
========================================== */

function renderizarAgenda(datos) {

  const tbody = document.getElementById("tablaAgenda");

  if (!tbody) return;

  tbody.innerHTML = "";

  datos.forEach((item, index) => {

    tbody.innerHTML += `

            <tr>

                <td>${index + 1}</td>

                <td>${item.actividad}</td>

                <td>${item.lugar}</td>

                <td>${formatearFecha(item.fecha)}</td>

                <td>${item.hora}</td>

            </tr>

        `;

  });

}

/* ==========================================
   SIDEBAR
========================================== */

function generarSidebarAgenda(datos) {

  generarAniosAgenda(datos);

  generarMesesAgenda(datos);

  generarLugaresAgenda(datos);



}

function generarAniosAgenda(datos) {

  const lista = document.getElementById("listaAniosAgenda");

  if (!lista) return;

  lista.innerHTML = "";

  const anios = [

    ...new Set(

      datos.map(item => item.fecha.substring(0,4))

    )

  ].sort((a,b)=>b-a);

  anios.forEach(anio=>{

    const li = document.createElement("li");

    li.textContent = anio;

    li.onclick = ()=>{

      filtroAnioAgenda =
        filtroAnioAgenda === anio ? "" : anio;

      activarItem(lista, li, filtroAnioAgenda);

      aplicarFiltrosAgenda();

    };

    lista.appendChild(li);

  });

}

function generarMesesAgenda(datos){

  const lista =
    document.getElementById("listaMesesAgenda");

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

  const existentes=[

    ...new Set(

      datos.map(item=>item.fecha.split("-")[1])

    )

  ];

  meses.forEach(([numero,nombre])=>{

    if(!existentes.includes(numero))
      return;

    const li=document.createElement("li");

    li.textContent=nombre;

    li.onclick=()=>{

      filtroMesAgenda=
        filtroMesAgenda===numero?"":numero;

      activarItem(lista,li,filtroMesAgenda);

      aplicarFiltrosAgenda();

    };

    lista.appendChild(li);

  });

}

function activarItem(lista,item,valor){

  lista.querySelectorAll("li")
    .forEach(li=>li.classList.remove("active"));

  if(valor){

    item.classList.add("active");

  }

}

/* ==========================================
   FILTROS
========================================== */

function aplicarFiltrosAgenda(){

  const texto = document
    .getElementById("buscarAgenda")
    .value
    .toLowerCase();

  const filtrados = agendaGlobal.filter(item=>{

    const anioOK =
      !filtroAnioAgenda ||
      item.fecha.startsWith(filtroAnioAgenda);

    const mesOK =
      !filtroMesAgenda ||
      item.fecha.split("-")[1] === filtroMesAgenda;

    const lugarOK =
      !filtroLugarAgenda ||
      item.lugar === filtroLugarAgenda;

    const textoOK =
      item.actividad.toLowerCase().includes(texto) ||
      item.lugar.toLowerCase().includes(texto);

    return anioOK &&
      mesOK &&
      lugarOK &&
      textoOK;

  });

  renderizarAgenda(filtrados);

}

/* ==========================================
   UTILIDADES
========================================== */

function formatearFecha(fecha){

  const partes = fecha.split("-");

  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

/* ==========================================
   EVENTOS
========================================== */

window.addEventListener("DOMContentLoaded",()=>{

  if(document.getElementById("tablaAgenda")){

    cargarAgenda();

  }

  const buscador = document.getElementById("buscarAgenda");

  if(buscador){

    buscador.addEventListener(
      "input",
      aplicarFiltrosAgenda
    );

  }

  document.querySelectorAll(".sidebar-toggle")
    .forEach(btn=>{

      btn.addEventListener("click",()=>{

        btn.parentElement.classList.toggle("active");

      });

    });

});

function generarLugaresAgenda(datos){

  const lista = document.getElementById("listaLugaresAgenda");

  if(!lista) return;

  lista.innerHTML = "";

  const lugares = [...new Set(datos.map(d => d.lugar))].sort();

  lugares.forEach(lugar => {

    const li = document.createElement("li");

    li.textContent = lugar;

    li.onclick = () => {

      filtroLugarAgenda =
        filtroLugarAgenda === lugar ? "" : lugar;

      activarItem(lista, li, filtroLugarAgenda);

      aplicarFiltrosAgenda();

    };

    lista.appendChild(li);

  });

  // ===== BUSCADOR DE LUGARES =====
  const input = document.getElementById("buscarLugarAgenda");

  if(input){

    input.oninput = function(){

      const texto = this.value.toLowerCase();

      lista.querySelectorAll("li").forEach(li => {

        li.style.display = li.textContent
          .toLowerCase()
          .includes(texto)
          ? ""
          : "none";

      });

    };

  }

}
