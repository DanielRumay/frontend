// ==========================================
//        VERIFICACIÓN DEL JAVASCRIPT
// ==========================================

console.log("========================================");
console.log("🚀 tabs.js INICIANDO...");
console.log("📅 Fecha:", new Date().toLocaleString());
console.log("🌐 Página:", window.location.href);
console.log("========================================");


// ==========================================
// COMPONENTES GLOBALES Y PESTAÑAS (TABS)
// ==========================================

const buttons = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");


// ==========================================
// VERIFICAR ELEMENTOS ENCONTRADOS
// ==========================================

console.log("📑 PESTAÑAS");

console.log(
  "🔘 Botones encontrados:",
  buttons.length
);

console.log(
  "📄 Contenidos encontrados:",
  contents.length
);


// Verificar si existen botones

if (buttons.length === 0) {

  console.warn(
    "⚠️ No se encontraron elementos con la clase .tab-btn"
  );

} else {

  console.log(
    "✅ Se encontraron los botones de las pestañas"
  );

}


// Verificar si existen contenidos

if (contents.length === 0) {

  console.warn(
    "⚠️ No se encontraron elementos con la clase .tab-content"
  );

} else {

  console.log(
    "✅ Se encontraron los contenidos de las pestañas"
  );

}


// ==========================================
// REGISTRAR EVENTOS
// ==========================================

buttons.forEach((button, index) => {

  console.log(
    `🔘 Registrando evento para botón ${index + 1}`
  );


  // Mostrar qué data-tab tiene cada botón

  const tab = button.getAttribute("data-tab");

  console.log(
    `   data-tab: ${tab || "❌ NO definido"}`
  );


  button.addEventListener("click", () => {

    console.log("========================================");

    console.log(
      `🖱️ CLICK en pestaña ${index + 1}`
    );

    console.log(
      "📌 data-tab:",
      tab
    );


    // ======================================
    // QUITAR ACTIVE DE BOTONES
    // ======================================

    buttons.forEach(btn => {

      btn.classList.remove("active");

    });

    console.log(
      "🔄 Clase 'active' eliminada de los botones"
    );


    // ======================================
    // QUITAR ACTIVE DE CONTENIDOS
    // ======================================

    contents.forEach(content => {

      content.classList.remove("active");

    });

    console.log(
      "🔄 Clase 'active' eliminada de los contenidos"
    );


    // ======================================
    // ACTIVAR BOTÓN ACTUAL
    // ======================================

    button.classList.add("active");

    console.log(
      "✅ Botón actual activado"
    );


    // ======================================
    // BUSCAR CONTENIDO
    // ======================================

    const targetContent =
      document.getElementById(tab);


    if (targetContent) {

      targetContent.classList.add("active");

      console.log(
        "✅ Contenido encontrado y activado:",
        targetContent.id
      );

    } else {

      console.error(
        "❌ No se encontró el contenido correspondiente"
      );

      console.error(
        "🔎 Se buscó el elemento con ID:",
        tab
      );

    }


    console.log("========================================");

  });

});

// ==========================================
// NAVBAR SIN BOOTSTRAP
// ==========================================

console.log("🧭 Inicializando navbar...");


// ==========================================
// BOTÓN MOBILE
// ==========================================

const navbarToggler =
  document.querySelector(".navbar-toggler");

const navbarCollapse =
  document.querySelector("#navbarNav");


if (navbarToggler && navbarCollapse) {

  navbarToggler.addEventListener("click", () => {

    const abierto =
      navbarCollapse.classList.toggle("active");

    navbarToggler.setAttribute(
      "aria-expanded",
      abierto
    );

    console.log(
      abierto
        ? "📂 Menú mobile abierto"
        : "📁 Menú mobile cerrado"
    );

  });

}


// ==========================================
// DROPDOWNS
// ==========================================

const dropdowns =
  document.querySelectorAll(".navbar .dropdown");


dropdowns.forEach(dropdown => {

  const toggle =
    dropdown.querySelector(".dropdown-toggle");


  if (!toggle) return;


  toggle.addEventListener("click", (e) => {

    e.preventDefault();

    // En escritorio dejamos que CSS controle
    // el dropdown mediante hover.

    if (window.innerWidth > 992) {
      return;
    }


    // Cerrar los demás dropdowns

    dropdowns.forEach(otro => {

      if (otro !== dropdown) {

        otro.classList.remove("active");

      }

    });


    // Abrir/cerrar actual

    dropdown.classList.toggle("active");

  });

});


// ==========================================
// CERRAR DROPDOWN AL HACER CLICK FUERA
// ==========================================

document.addEventListener("click", (e) => {

  if (!e.target.closest(".navbar")) {

    dropdowns.forEach(dropdown => {

      dropdown.classList.remove("active");

    });

  }

});


console.log("✅ Navbar inicializado correctamente");

// ==========================================
// FINAL DEL JAVASCRIPT
// ==========================================

console.log("========================================");
console.log("✅ tabs.js FINALIZADO CORRECTAMENTE");
console.log("🚀 El archivo JS llegó hasta el final");
console.log("========================================");
