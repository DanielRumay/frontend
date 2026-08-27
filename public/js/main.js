// ======================================================
//              INICIO - VERIFICACIÓN DEL JS
// ======================================================

console.log("========================================");
console.log("🚀 main.js INICIANDO...");
console.log("📅 Fecha:", new Date().toLocaleString());
console.log("🌐 Página:", window.location.href);
console.log("========================================");


// ======================================================
//                  CONFIGURACIÓN API
// ======================================================

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

console.log("🔗 API_URL:", API_URL);


// ======================================================
//                  ELEMENTOS DEL CHAT
// ======================================================

const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");

console.log("💬 ELEMENTOS DEL CHAT");
console.log(
  "   userInput:",
  userInput ? "✅ encontrado" : "❌ NO encontrado"
);
console.log(
  "   sendBtn:",
  sendBtn ? "✅ encontrado" : "❌ NO encontrado"
);
console.log(
  "   chatBox:",
  chatBox ? "✅ encontrado" : "❌ NO encontrado"
);


// ======================================================
//                  INTRO
// ======================================================

window.addEventListener("load", () => {

  console.log("✅ Evento window.load ejecutado");

  const intro = document.getElementById("intro");

  console.log(
    "🎬 intro:",
    intro ? "✅ encontrado" : "❌ NO encontrado"
  );

  if (!intro) return;

  setTimeout(() => {

    console.log("🎬 Ocultando intro");

    intro.classList.add("intro-hide");

    setTimeout(() => {

      console.log("🗑️ Eliminando intro");

      intro.remove();

    }, 800);

  }, 2000);

});


// ======================================================
//                  POPUP VIDEO
// ======================================================

const boton = document.getElementById("btnFlotante");
const popup = document.getElementById("popupVideo");
const video = document.getElementById("miVideo");
const cerrar = document.getElementById("cerrarPopup");

console.log("🎥 POPUP VIDEO");

console.log(
  "   btnFlotante:",
  boton ? "✅ encontrado" : "❌ NO encontrado"
);

console.log(
  "   popupVideo:",
  popup ? "✅ encontrado" : "❌ NO encontrado"
);

console.log(
  "   miVideo:",
  video ? "✅ encontrado" : "❌ NO encontrado"
);

console.log(
  "   cerrarPopup:",
  cerrar ? "✅ encontrado" : "❌ NO encontrado"
);


let temporizador;


// ABRIR POPUP

if (boton && popup && video && cerrar) {

  console.log("✅ Eventos del popup de video registrados");

  boton.addEventListener("click", () => {

    console.log("▶️ Botón del video presionado");

    popup.style.display = "flex";

    video.currentTime = 0;

    video.play().catch(error => {

      console.error("❌ Error al reproducir video:", error);

    });

    clearTimeout(temporizador);

    temporizador = setTimeout(() => {

      console.log("⏱️ Tiempo máximo del video alcanzado");

      cerrarVideo();

    }, 84000);

  });


  cerrar.addEventListener("click", cerrarVideo);

} else {

  console.warn(
    "⚠️ No se registraron los eventos del popup porque faltan elementos HTML."
  );

}


// ======================================================
//                  CERRAR VIDEO
// ======================================================

function cerrarVideo() {

  console.log("❌ Cerrando popup de video");

  if (!popup || !video) {

    console.warn("⚠️ popup o video no existen");

    return;

  }

  popup.style.display = "none";

  video.pause();

  clearTimeout(temporizador);

}


// ======================================================
//                  POPUP BIENVENIDA
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ DOMContentLoaded ejecutado");


  const popupBienvenida =
    document.getElementById("popupBienvenida");

  const carouselPopup =
    document.getElementById("carouselPopup");

  const cerrarPopupBienvenida =
    document.getElementById("cerrarPopupBienvenida");


  console.log("👋 POPUP BIENVENIDA");

  console.log(
    "   popupBienvenida:",
    popupBienvenida ? "✅ encontrado" : "❌ NO encontrado"
  );

  console.log(
    "   carouselPopup:",
    carouselPopup ? "✅ encontrado" : "❌ NO encontrado"
  );

  console.log(
    "   cerrarPopupBienvenida:",
    cerrarPopupBienvenida
      ? "✅ encontrado"
      : "❌ NO encontrado"
  );


  // ====================================================
  //                  CAROUSEL
  // ====================================================

  if (carouselPopup) {

    if (
      typeof bootstrap !== "undefined" &&
      bootstrap.Carousel
    ) {

      console.log("🎠 Inicializando Bootstrap Carousel");

      new bootstrap.Carousel(carouselPopup, {

        interval: 1000,
        ride: "carousel",
        pause: false,
        wrap: true

      });

      console.log("✅ Carousel iniciado");

    } else {

      console.error(
        "❌ Bootstrap no está disponible."
      );

    }

  }


  // ====================================================
  //              CIERRE AUTOMÁTICO
  // ====================================================

  if (popupBienvenida) {

    console.log(
      "⏱️ Temporizador del popup iniciado"
    );

    const timer = setTimeout(() => {

      console.log(
        "👋 Cerrando popup automáticamente"
      );

      popupBienvenida.classList.add("ocultar");

      setTimeout(() => {

        if (popupBienvenida) {

          popupBienvenida.remove();

          console.log(
            "🗑️ Popup eliminado del DOM"
          );

        }

      }, 500);

    }, 5000);


    // ==================================================
    //              CIERRE MANUAL
    // ==================================================

    if (cerrarPopupBienvenida) {

      cerrarPopupBienvenida.addEventListener(
        "click",
        () => {

          console.log(
            "❌ Popup cerrado manualmente"
          );

          clearTimeout(timer);

          popupBienvenida.classList.add(
            "ocultar"
          );

          setTimeout(() => {

            if (popupBienvenida) {

              popupBienvenida.remove();

              console.log(
                "🗑️ Popup eliminado manualmente"
              );

            }

          }, 500);

        }
      );

    }

  }

});


// ======================================================
//                  PREGUNTAS CHAT
// ======================================================

const preguntas = [

  {
    pregunta:
      "¿Cómo puedo saber qué infracciones tengo?",

    claves: [
      "infraccion",
      "infracciones",
      "multa",
      "multas"
    ],

    respuesta:
      "Entra a la web, selecciona en la barra de tareas Servicios y luego haz clic en Sistema Interno de Infracciones. Allí podrás ingresar tu documento de identidad."
  },

  {
    pregunta:
      "¿Cómo puedo informarme más sobre ustedes?",

    claves: [
      "ustedes",
      "municipalidad",
      "informacion",
      "información"
    ],

    respuesta:
      "En la barra de opciones encontrarás Municipalidad y luego la pestaña Nosotros donde se encuentra toda la información institucional."
  },

  {
    pregunta:
      "¿Cómo puedo acceder a la Mesa de Partes Virtual?",

    claves: [
      "mesa de partes",
      "tramite",
      "trámite",
      "documento"
    ],

    respuesta:
      "Selecciona la opción Mesa de Partes Virtual ubicada en la barra de navegación. Serás redirigido al portal del Gobierno para realizar tu solicitud."
  },

  {
    pregunta:
      "¿Cómo puedo ver mi brevete o licencia de conducir?",

    claves: [
      "brevete",
      "licencia",
      "conducir"
    ],

    respuesta:
      "Entra a Servicios y luego a Consulta de Licencia. Allí podrás ingresar tu documento de identidad para conocer el estado de tu licencia."
  },

  {
    pregunta:
      "¿Qué hago si no encuentro lo que busco?",

    claves: [
      "no encuentro",
      "ayuda",
      "buscar",
      "busco"
    ],

    respuesta:
      "Puedes dirigirte a la sección Contacto y enviarnos tu consulta para recibir ayuda."
  }

];

console.log(
  "📚 Preguntas del chatbot cargadas:",
  preguntas.length
);


// ======================================================
//              OBTENER RESPUESTA
// ======================================================

function obtenerRespuesta(texto) {

  console.log(
    "🔎 Buscando respuesta para:",
    texto
  );

  texto = texto.toLowerCase();

  for (const pregunta of preguntas) {

    if (
      pregunta.claves.some(
        clave => texto.includes(clave)
      )
    ) {

      console.log(
        "✅ Coincidencia encontrada:",
        pregunta.pregunta
      );

      return pregunta.respuesta;

    }

  }

  console.log(
    "⚠️ No se encontró una coincidencia"
  );

  return "Lo siento, no encontré información sobre esa consulta. Puedes comunicarte mediante la sección Contacto para recibir ayuda.";

}


// ======================================================
//              AGREGAR MENSAJE
// ======================================================

function agregarMensaje(texto, tipo) {

  console.log(
    `💬 Agregando mensaje (${tipo}):`,
    texto
  );

  if (!chatBox) {

    console.error(
      "❌ No existe #chatBox en el HTML"
    );

    return;

  }

  const mensaje =
    document.createElement("div");

  mensaje.className =
    `message ${tipo}`;

  mensaje.textContent = texto;

  chatBox.appendChild(mensaje);

  chatBox.scrollTop =
    chatBox.scrollHeight;

}


// ======================================================
//                  ENVIAR PREGUNTA
// ======================================================

function enviarPregunta() {

  console.log(
    "📨 ejecutar enviarPregunta()"
  );

  if (!userInput) {

    console.error(
      "❌ No existe #userInput"
    );

    return;

  }

  const pregunta =
    userInput.value.trim();

  console.log(
    "📝 Pregunta:",
    pregunta
  );

  if (!pregunta) {

    console.log(
      "⚠️ Pregunta vacía"
    );

    return;

  }

  agregarMensaje(
    pregunta,
    "user"
  );

  userInput.value = "";


  setTimeout(() => {

    console.log(
      "🤖 Generando respuesta..."
    );

    const respuesta =
      obtenerRespuesta(pregunta);

    console.log(
      "💬 Respuesta:",
      respuesta
    );

    agregarMensaje(
      respuesta,
      "bot"
    );

  }, 500);

}


// ======================================================
//                  EVENTOS CHAT
// ======================================================

if (sendBtn) {

  console.log(
    "✅ Evento CLICK del botón registrado"
  );

  sendBtn.addEventListener(
    "click",
    enviarPregunta
  );

} else {

  console.warn(
    "⚠️ #sendBtn no existe"
  );

}


if (userInput) {

  console.log(
    "✅ Evento ENTER del input registrado"
  );

  userInput.addEventListener(
    "keydown",
    (e) => {

      if (e.key === "Enter") {

        console.log(
          "⌨️ ENTER presionado"
        );

        enviarPregunta();

      }

    }
  );

}


// ======================================================
//                  CHAT TOGGLE
// ======================================================

const chatToggle =
  document.getElementById("chatToggle");

const chatWidget =
  document.getElementById("chatWidget");

const closeChat =
  document.getElementById("closeChat");


console.log("💬 CHAT WIDGET");

console.log(
  "   chatToggle:",
  chatToggle ? "✅ encontrado" : "❌ NO encontrado"
);

console.log(
  "   chatWidget:",
  chatWidget ? "✅ encontrado" : "❌ NO encontrado"
);

console.log(
  "   closeChat:",
  closeChat ? "✅ encontrado" : "❌ NO encontrado"
);


if (chatToggle && chatWidget) {

  console.log(
    "✅ Evento abrir/cerrar chat registrado"
  );

  chatToggle.addEventListener(
    "click",
    () => {

      console.log(
        "💬 Toggle del chat presionado"
      );

      chatWidget.classList.toggle(
        "active"
      );

    }
  );

}


if (closeChat && chatWidget) {

  console.log(
    "✅ Evento cerrar chat registrado"
  );

  closeChat.addEventListener(
    "click",
    () => {

      console.log(
        "❌ Cerrando chat"
      );

      chatWidget.classList.remove(
        "active"
      );

    }
  );

}


// ======================================================
//              OPCIONES DEL CHAT
// ======================================================

function cargarOpcionesChat() {

  console.log(
    "📋 Ejecutando cargarOpcionesChat()"
  );

  const contenedor =
    document.getElementById("opcionesChat");

  if (!contenedor) {

    console.warn(
      "⚠️ #opcionesChat no existe en esta página"
    );

    return;

  }

  contenedor.innerHTML = "";


  preguntas.forEach(item => {

    const boton =
      document.createElement("button");

    boton.className =
      "chat-option";

    boton.textContent =
      item.pregunta;


    boton.addEventListener(
      "click",
      () => {

        console.log(
          "💬 Opción seleccionada:",
          item.pregunta
        );

        agregarMensaje(
          item.pregunta,
          "user"
        );


        setTimeout(() => {

          agregarMensaje(
            item.respuesta,
            "bot"
          );

        }, 400);

      }
    );


    contenedor.appendChild(
      boton
    );

  });


  console.log(
    `✅ ${preguntas.length} opciones del chat cargadas`
  );

}


// ======================================================
//              EJECUTAR OPCIONES CHAT
// ======================================================

cargarOpcionesChat();


// ======================================================
//                  FORMULARIO CONTACTO
// ======================================================

const formContacto =
  document.getElementById("formContacto");


console.log(
  "📨 FORMULARIO CONTACTO:",
  formContacto
    ? "✅ encontrado"
    : "❌ NO encontrado"
);


if (formContacto) {

  console.log(
    "✅ Evento SUBMIT registrado"
  );

  formContacto.addEventListener(
    "submit",
    enviarContacto
  );

}


// ======================================================
//                  ENVIAR CONTACTO
// ======================================================

async function enviarContacto(e) {

  console.log(
    "📨 ejecutar enviarContacto()"
  );

  e.preventDefault();


  const nombre =
    document
      .getElementById("nombre")
      ?.value
      .trim();

  const correo =
    document
      .getElementById("correo")
      ?.value
      .trim();

  const asunto =
    document
      .getElementById("asunto")
      ?.value
      .trim();

  const mensaje =
    document
      .getElementById("mensaje")
      ?.value
      .trim();


  console.log(
    "📋 Datos del formulario:",
    {
      nombre,
      correo,
      asunto,
      mensaje
    }
  );


  if (
    !nombre ||
    !correo ||
    !asunto ||
    !mensaje
  ) {

    console.warn(
      "⚠️ Faltan campos del formulario"
    );

    alert(
      "Complete todos los campos."
    );

    return;

  }


  const contacto = {

    nombre,
    correo,
    asunto,
    mensaje

  };


  console.log(
    "📡 Enviando datos a:",
    `${API_URL}/contacto`
);


try {

  const response =
    await fetch(
      `${API_URL}/contacto`,
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(contacto)

      }
    );


  console.log(
    "📡 Status HTTP:",
    response.status
  );


  if (!response.ok) {

    throw new Error(
      `Error HTTP ${response.status}`
    );

  }


  console.log(
    "✅ Consulta enviada correctamente"
  );


  alert(
    "Consulta enviada correctamente."
  );


  formContacto.reset();


} catch (error) {

  console.error(
    "❌ ERROR enviando consulta:",
    error
  );


  alert(
    "No se pudo enviar la consulta."
  );

}

}


// ======================================================
//                  FIN DEL JAVASCRIPT
// ======================================================

console.log("========================================");
console.log("✅ main.js FINALIZADO CORRECTAMENTE");
console.log("🚀 El archivo JS llegó hasta el final");
console.log("========================================");
