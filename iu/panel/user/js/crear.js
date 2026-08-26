const botones=document.querySelectorAll(".card-opcion");
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

botones.forEach(boton=>{

  boton.addEventListener("click",()=>{

    const ruta=boton.dataset.url;

    window.location.href=ruta;

  });

});

async function verificarSesion(){

  const response = await fetch(
    `${API_URL}/usuarios/auth/verificar`,
    {
      credentials:"include"
    }
  );

  if(!response.ok){

    window.location.href="../error.html";

  }

}

verificarSesion();
