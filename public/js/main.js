import { Carousel } from 'bootstrap';

const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
console.log("main.js cargado");


window.addEventListener("load", () => {

  const intro = document.getElementById("intro");

  if (!intro) return;

  setTimeout(() => {

    intro.classList.add("intro-hide");

    setTimeout(() => {

      intro.remove();

    }, 800);

  }, 2000);

});

const boton = document.getElementById("btnFlotante");
const popup = document.getElementById("popupVideo");
const video = document.getElementById("miVideo");
const cerrar = document.getElementById("cerrarPopup");

let temporizador;

// ABRIR POPUP
if (boton && popup && video && cerrar) {

  boton.addEventListener("click", () => {

    popup.style.display = "flex";

    video.currentTime = 0;

    video.play();

    clearTimeout(temporizador);

    temporizador = setTimeout(() => {

      cerrarVideo();

    }, 84000);

  });

  cerrar.addEventListener(
    "click",
    cerrarVideo
  );

}

// FUNCIÓN CERRAR
function cerrarVideo(){

  popup.style.display = "none";

  video.pause();

  clearTimeout(temporizador);
}


/* =========================
   CAROUSEL AUTO 1 SEGUNDO
========================= */

document.addEventListener("DOMContentLoaded", () => {

  const popup = document.getElementById("popupBienvenida");
  const carouselPopup = document.getElementById("carouselPopup");

  if (carouselPopup) {

    new Carousel(carouselPopup, {
      interval: 1000,
      ride: "carousel",
      pause: false,
      wrap: true
    });

  }

  if (popup) {

    setTimeout(() => {

      popup.classList.add("ocultar");

      setTimeout(() => {
        popup.remove();
      }, 500);

    }, 5000);

  }

});

// =========================
// EVENTOS
// =========================

if (sendBtn) {
  sendBtn.addEventListener("click", enviarPregunta);
}

if (userInput) {

  userInput.addEventListener(
    "keydown",
    (e) => {

      if (e.key === "Enter") {
        enviarPregunta();
      }

    }
  );

}

console.log("main.js finalizado");

document.addEventListener("DOMContentLoaded", () => {

  const popup = document.getElementById("popupBienvenida");
  const carouselPopup = document.getElementById("carouselPopup");
  const cerrarPopupBienvenida = document.getElementById("cerrarPopupBienvenida");

  if (carouselPopup) {

    new Carousel(carouselPopup, {
      interval: 1000,
      ride: "carousel",
      pause: false,
      wrap: true
    });

  }

  // Cierre automático
  if (popup) {

    const timer = setTimeout(() => {

      popup.classList.add("ocultar");

      setTimeout(() => {
        popup.remove();
      }, 500);

    }, 5000);

    // Cierre manual
    if (cerrarPopupBienvenida) {

      cerrarPopupBienvenida.addEventListener("click", () => {

        clearTimeout(timer);

        popup.classList.add("ocultar");

        setTimeout(() => {
          popup.remove();
        }, 500);

      });

    }

  }

});


/*-------------------------------
          CHAT BOT
---------------------------------*/

function agregarMensaje(texto, tipo) {

  const mensaje = document.createElement("div");

  mensaje.className = `message ${tipo}`;

  mensaje.textContent = texto;

  chatBox.appendChild(mensaje);

  chatBox.scrollTop = chatBox.scrollHeight;
}

const preguntas = [
  {
    pregunta: "¿Cómo puedo saber qué infracciones tengo?",
    respuesta: "Entra a la web, selecciona en la barra de tareas Servicios y luego haz clic en Sistema Interno de Infracciones. Allí podrás ingresar tu documento de identidad."
  },
  {
    pregunta: "¿Cómo puedo informarme más sobre ustedes?",
    respuesta: "En la barra de opciones encontrarás Municipalidad y luego la pestaña Nosotros donde se encuentra toda la información institucional."
  },
  {
    pregunta: "¿Cómo puedo acceder a la Mesa de Partes Virtual?",
    respuesta: "Selecciona la opción Mesa de Partes Virtual ubicada en la barra de navegación. Serás redirigido al portal del Gobierno para realizar tu solicitud."
  },
  {
    pregunta: "¿Cómo puedo ver mi brevete o licencia de conducir?",
    respuesta: "Entra a Servicios y luego a Consulta de Licencia. Allí podrás ingresar tu documento de identidad para conocer el estado de tu licencia."
  },
  {
    pregunta: "¿Qué hago si no encuentro lo que busco?",
    respuesta: "Puedes dirigirte a la sección Contacto y enviarnos tu consulta para recibir ayuda."
  }
];

function obtenerRespuesta(texto) {

  texto = texto.toLowerCase();

  for (const pregunta of preguntas) {

    if (
      pregunta.claves.some(
        clave => texto.includes(clave)
      )
    ) {
      return pregunta.respuesta;
    }

  }

  return "Lo siento, no encontré información sobre esa consulta. Puedes comunicarte mediante la sección Contacto para recibir ayuda.";
}

function enviarPregunta() {

  const pregunta = userInput.value.trim();

  if (!pregunta) return;

  agregarMensaje(pregunta, "user");

  userInput.value = "";

  setTimeout(() => {

    const respuesta = obtenerRespuesta(pregunta);

    agregarMensaje(respuesta, "bot");

  }, 500);

}

const chatToggle = document.getElementById("chatToggle");
const chatWidget = document.getElementById("chatWidget");
const closeChat = document.getElementById("closeChat");

if (chatToggle && chatWidget) {
  chatToggle.addEventListener("click", () => {
    chatWidget.classList.toggle("active");
  });
}

if (closeChat && chatWidget) {
  closeChat.addEventListener("click", () => {
    chatWidget.classList.remove("active");
  });
}

function cargarOpcionesChat() {

  const contenedor = document.getElementById("opcionesChat");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  preguntas.forEach(item => {

    const boton = document.createElement("button");

    boton.className = "chat-option";

    boton.textContent = item.pregunta;

    boton.addEventListener("click", () => {

      agregarMensaje(item.pregunta, "user");

      setTimeout(() => {

        agregarMensaje(item.respuesta, "bot");

      }, 400);

    });

    contenedor.appendChild(boton);

  });

}

cargarOpcionesChat();

const formContacto = document.getElementById("formContacto");

if (formContacto) {

  formContacto.addEventListener("submit", enviarContacto);

}

async function enviarContacto(e) {

  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const asunto = document.getElementById("asunto").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();

  if (!nombre || !correo || !asunto || !mensaje) {

    alert("Complete todos los campos.");

    return;

  }

  const contacto = {
    nombre,
    correo,
    asunto,
    mensaje
  };

  try {

    const response = await fetch(
      "http://localhost:8080/contacto",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contacto)
      }
    );

    if (!response.ok) {

      throw new Error("Error al enviar la consulta.");

    }

    alert("Consulta enviada correctamente.");

    formContacto.reset();

  } catch (error) {

    console.error(error);

    alert("No se pudo enviar la consulta.");

  }

}

