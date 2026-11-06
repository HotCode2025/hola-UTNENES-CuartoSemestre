propagarDestino('a[href="registro.html"]');

document.getElementById("form-login").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const mensaje = document.getElementById("mensaje");
  const boton = document.getElementById("btnLogin");
  boton.disabled = true;
  mensaje.textContent = "";

  try {
    const datos = await pedirUsuarioAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({
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