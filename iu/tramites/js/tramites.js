window.mostrarRequisito = function(id, boton){

  // OCULTAR TODOS LOS CUADROS
  document.querySelectorAll('.requisito-box')
    .forEach(box => {
      box.classList.remove('active');
    });

  // QUITAR ACTIVE A BOTONES
  document.querySelectorAll('.btn-requisito')
    .forEach(btn => {
      btn.classList.remove('active');
    });

  // MOSTRAR EL SELECCIONADO
  document.getElementById(id)
    .classList.add('active');

  // ACTIVAR BOTON
  boton.classList.add('active');

}
