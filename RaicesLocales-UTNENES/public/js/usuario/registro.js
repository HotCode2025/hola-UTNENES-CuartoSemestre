propagarDestino('a[href="login.html"]');

document.getElementById("form-registro").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const mensaje = document.getElementById("mensaje");
  const boton = document.getElementById("btnRegistrar");
  boton.disabled = true;
  mensaje.textContent = "";

  try {
    const usuario = await pedirUsuarioAPI("/auth/registro", {
      method: "POST",
      body: JSON.stringify({
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
      }),
    });
    location.href = obtenerDestinoSeguro();
  } catch (error) {
    mensaje.textContent = error.message;
  } finally {
    boton.disabled = false;
  }
});