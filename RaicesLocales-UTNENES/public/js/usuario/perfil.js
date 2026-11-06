async function cargarPerfil() {
  try {
    const datos = await pedirUsuarioAPI("/auth/me");
    document.getElementById("nombreUsuario").textContent =
      `${datos.usuario.nombre} ${datos.usuario.apellido}`;
    document.getElementById("emailUsuario").textContent = datos.usuario.email;
  } catch (error) {
    if (error.status === 401) {
      location.href = "login.html";
      return;
    }
    document.getElementById("mensaje").textContent = error.message;
  }
}

document.getElementById("logout").addEventListener("click", async () => {
  const boton = document.getElementById("logout");
  boton.disabled = true;
  try {
    await pedirUsuarioAPI("/auth/logout", { method: "POST" });
    location.href = "login.html";
  } catch (error) {
    document.getElementById("mensaje").textContent = error.message;
    boton.disabled = false;
  }
});

cargarPerfil();