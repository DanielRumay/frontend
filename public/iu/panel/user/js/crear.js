const botones = document.querySelectorAll(".card-opcion");
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

const btnPerfil = document.getElementById("btnPerfil");
const menuPerfil = document.getElementById("menuPerfil");
const fotoPerfil = document.getElementById("fotoPerfil");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const modalLogout = document.getElementById("modalLogout");
const btnCancelarLogout = document.getElementById("btnCancelarLogout");
const btnConfirmarLogout = document.getElementById("btnConfirmarLogout");

let redirigiendoLogin = false;

botones.forEach(boton => {
  boton.addEventListener("click", () => {
    const ruta = boton.dataset.url;
    window.location.href = ruta;
  });
});

async function verificarSesion() {
  try {
    const response = await fetch(
      `${API_URL}/usuarios/auth/verificar`,
      {
        credentials: "include"
      }
    );

    if (!response.ok) {
      window.location.href = "../error.html";
      return;
    }

    const usuario = await response.json();
    if (usuario && usuario.fotoPerfil && fotoPerfil) {
      fotoPerfil.src = usuario.fotoPerfil;
    }
  } catch (error) {
    console.error("Error verificando sesión:", error);
    window.location.href = "../error.html";
  }
}

function configurarPerfil() {
  if (btnPerfil && menuPerfil) {
    btnPerfil.addEventListener("click", (e) => {
      e.stopPropagation();
      menuPerfil.classList.toggle("visible");
    });

    document.addEventListener("click", (e) => {
      if (!menuPerfil.contains(e.target) && !btnPerfil.contains(e.target)) {
        menuPerfil.classList.remove("visible");
      }
    });
  }

  if (btnCerrarSesion && modalLogout) {
    btnCerrarSesion.addEventListener("click", () => {
      menuPerfil.classList.remove("visible");
      modalLogout.style.display = "flex";
    });
  }

  if (btnCancelarLogout && modalLogout) {
    btnCancelarLogout.addEventListener("click", () => {
      modalLogout.style.display = "none";
    });
  }

  if (btnConfirmarLogout) {
    btnConfirmarLogout.addEventListener("click", cerrarSesion);
  }
}

async function cerrarSesion() {
  if (redirigiendoLogin) return;

  if (btnConfirmarLogout) btnConfirmarLogout.disabled = true;

  try {
    const respuesta = await fetch(`${API_URL}/usuarios/logout`, {
      method: "POST",
      credentials: "include",
      cache: "no-store"
    });

    if (respuesta.ok || respuesta.status === 401) {
      redirigiendoLogin = true;
      window.location.replace("../error.html");
      return;
    }
    throw new Error("No se pudo cerrar la sesión.");
  } catch (error) {
    console.error("Error cerrando sesión:", error);
    if (btnConfirmarLogout) btnConfirmarLogout.disabled = false;
    alert("No se pudo cerrar la sesión. Intente nuevamente.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
  configurarPerfil();
});
