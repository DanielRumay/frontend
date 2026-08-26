const form = document.getElementById("formLogin");

const usuario = document.getElementById("usuario");

const password = document.getElementById("password");

const boton = document.getElementById("mostrarPassword");

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://ascope-backend.onrender.com";

/* ==============================
   MOSTRAR / OCULTAR PASSWORD
============================== */
/* ==============================
   MOSTRAR / OCULTAR PASSWORD
============================== */
/* ==============================
   MOSTRAR / OCULTAR PASSWORD
============================== */
/* ==============================
   MOSTRAR / OCULTAR PASSWORD
============================== */

boton.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        boton.innerHTML = '<i class="bi bi-eye-slash"></i>';

    } else {

        password.type = "password";

        boton.innerHTML = '<i class="bi bi-eye"></i>';

    }

});


/* ==============================
   INICIO DE SESIÓN
============================== */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const datos = {

        usuario: usuario.value,

        password: password.value

    };


    try {

        const response = await fetch(
          `${API_URL}/usuarios/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              usuario,
              password
            })
          }
        );


        /* ==============================
           LOGIN CORRECTO
        ============================== */

        if (response.ok) {

            const user = await response.json();

            console.log("Usuario recibido:", user);

            console.log("Rol:", user.rol);


            /* ==============================
               REDIRECCIÓN SEGÚN ROL
            ============================== */

            if (user.rol === "ADMIN") {

                window.location.href = "admin/dashboard.html";

            } else if (user.rol === "PERSONAL_ADMINISTRATIVO") {

                window.location.href = "user/panel_creacion.html";

            } else {

                alert("El usuario no tiene un rol válido.");

            }


        } else {

            alert("Usuario o contraseña incorrectos");

        }


    } catch (error) {

        console.error(error);

        alert("No se pudo conectar con el servidor");

    }

});
