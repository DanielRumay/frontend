// ==========================================
// COMPONENTES GLOBALES Y PESTAÑAS (TABS)
// ==========================================

const buttons = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    // Quitar active de botones
    buttons.forEach(btn => btn.classList.remove("active"));

    // Quitar active de contenidos
    contents.forEach(content => content.classList.remove("active"));

    // Activar botón actual
    button.classList.add("active");

    // Activar contenido correspondiente
    const tab = button.getAttribute("data-tab");
    const targetContent = document.getElementById(tab);
    if (targetContent) {
      targetContent.classList.add("active");
    }
  });
});
